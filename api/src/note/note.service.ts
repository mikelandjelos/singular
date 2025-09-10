import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Note } from './note.entity';
import { Project } from '../project/project.entity';
import { Tag } from '../tag/tag.entity';
import { TagService } from '../tag/tag.service';
import {
  CreateNoteInput,
  CreateNoteResult,
  ListNotesParams,
  UpdateNoteInput,
  UpdateNoteResult,
} from './note.types';

@Injectable()
export class NoteService {
  private readonly logger = new Logger(NoteService.name);

  constructor(
    @InjectRepository(Note) private readonly noteRepo: Repository<Note>,
    @InjectRepository(Project) private readonly projRepo: Repository<Project>,
    @InjectRepository(Tag) private readonly tagRepo: Repository<Tag>,
    private readonly tagService: TagService,
  ) {}

  sanitize(n: Note) {
    return {
      id: n.id,
      userId: n.userId,
      title: n.title,
      workDate: n.workDate ?? null,
      content: n.content ?? '',
      project: n.project
        ? {
            id: n.project.id,
            name: n.project.name,
            color: n.project.color ?? null,
          }
        : null,
      tags: (n.tags || []).map((t) => ({
        id: t.id,
        userId: t.userId,
        name: t.name,
        color: t.color ?? null,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        deletedAt: t.deletedAt ?? null,
      })),
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
      deletedAt: n.deletedAt ?? null,
    };
  }

  async create(
    userId: string,
    input: CreateNoteInput,
  ): Promise<CreateNoteResult> {
    let project: Project | null = null;
    if (input.projectId) {
      project = await this.projRepo.findOne({
        where: { id: input.projectId, ownerId: userId },
      });
      if (!project) return { ok: false, reason: 'bad_project' };
    }

    const tagsById = await this.tagService.findByIds(
      userId,
      input.tagIds || [],
    );
    const tagsByName = await this.tagService.findOrCreateByNames(
      userId,
      input.tagNames || [],
    );
    const tags = this.uniqueTags([...tagsById, ...tagsByName]);

    const today = new Date().toISOString().slice(0, 10);

    const note = this.noteRepo.create({
      userId,
      title: input.title,
      content: input.content ?? '',
      workDate: input.workDate ?? today,
      projectId: input.projectId ?? null,
      project: project ?? null,
      tags,
    });

    const saved = await this.noteRepo.save(note);
    return { ok: true, note: saved };
  }

  async listOffset(
    userId: string,
    p: ListNotesParams,
  ): Promise<{
    items: Note[];
    meta: {
      offset: number;
      limit: number;
      total: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const offset = p.offset ?? 0;
    const limit = p.limit ?? 20;
    const archived = !!p.archived;

    const base = this.noteRepo
      .createQueryBuilder('n')
      .where('n.user_id = :userId', { userId });

    if (archived) {
      base.withDeleted().andWhere('n.deleted_at IS NOT NULL');
    } else {
      base.andWhere('n.deleted_at IS NULL');
    }

    if (p.projectIds?.length) {
      base.andWhere('n.project_id IN (:...pids)', { pids: p.projectIds });
    }

    if (p.tagIds?.length) {
      base
        .andWhere((qb) => {
          const sub = qb
            .subQuery()
            .select('nt.note_id')
            .from('note_tag', 'nt')
            .where('nt.tag_id IN (:...tids)')
            .getQuery();
          return `n.id IN ${sub}`;
        })
        .setParameter('tids', p.tagIds);
    }

    if (p.q?.trim()) {
      base
        .andWhere('(n.title ILIKE :s OR n.content ILIKE :s)', {
          s: `%${p.q.trim()}%`,
        })
        .orderBy(
          `GREATEST(similarity(n.title, :q), similarity(n.content, :q))`,
          'DESC',
        )
        .addOrderBy('n.updated_at', 'DESC')
        .setParameter('q', p.q.trim());
    } else {
      base.orderBy('n.updated_at', 'DESC');
    }

    const idQb = base
      .clone()
      .select('n.id', 'id')
      .distinct(true)
      .offset(offset)
      .limit(limit);
    const countQb = base.clone().select('n.id').distinct(true);

    const idsRows = await idQb.getRawMany<{ id: string }>();
    const ids = idsRows.map((r) => r.id);
    const total = await countQb.getCount();

    if (!ids.length) {
      return {
        items: [],
        meta: { offset, limit, total, hasNext: false, hasPrev: offset > 0 },
      };
    }

    const items = await this.noteRepo.find({
      where: { id: In(ids) },
      relations: { tags: true, project: true },
      withDeleted: true,
    });

    const orderMap = new Map(ids.map((id, i) => [id, i]));
    items.sort((a, b) => orderMap.get(a.id)! - orderMap.get(b.id)!);

    return {
      items,
      meta: {
        offset,
        limit,
        total,
        hasNext: offset + limit < total,
        hasPrev: offset > 0,
      },
    };
  }

  async findById(userId: string, id: string): Promise<Note | null> {
    return this.noteRepo.findOne({
      where: { id, userId },
      relations: { tags: true, project: true },
      withDeleted: true,
    });
  }

  async update(
    userId: string,
    id: string,
    patch: UpdateNoteInput,
  ): Promise<UpdateNoteResult> {
    const current = await this.findById(userId, id);
    if (!current) return { ok: false, reason: 'not_found' };

    if ('projectId' in patch) {
      if (patch.projectId) {
        const proj = await this.projRepo.findOne({
          where: { id: patch.projectId, ownerId: userId },
        });
        if (!proj) return { ok: false, reason: 'bad_project' };
        current.projectId = proj.id;
        current.project = proj;
      } else {
        current.projectId = null;
        current.project = null;
      }
    }

    if (patch.title !== undefined) current.title = patch.title!;
    if (patch.content !== undefined) current.content = patch.content ?? '';
    if (patch.workDate !== undefined) current.workDate = patch.workDate ?? null;

    if (patch.tagIds !== undefined || patch.tagNames !== undefined) {
      const byId = await this.tagService.findByIds(userId, patch.tagIds || []);
      const byName = await this.tagService.findOrCreateByNames(
        userId,
        patch.tagNames || [],
      );
      current.tags = this.uniqueTags([...byId, ...byName]);
    }

    const saved = await this.noteRepo.save(current);

    await this.tagService.pruneUnused(userId);

    return { ok: true, note: saved };
  }

  async softDelete(userId: string, id: string): Promise<number> {
    const res = await this.noteRepo.softDelete({ id, userId });
    if (res.affected) await this.tagService.pruneUnused(userId);
    return res.affected ?? 0;
  }

  async restore(userId: string, id: string): Promise<number> {
    const res = await this.noteRepo.restore({ id, userId });
    return res.affected ?? 0;
  }

  async hardDelete(userId: string, id: string): Promise<void> {
    await this.noteRepo.delete({ id, userId });
    await this.tagService.pruneUnused(userId);
  }

  private uniqueTags(tags: Tag[]): Tag[] {
    const map = new Map<string, Tag>();
    for (const t of tags) map.set(t.id, t);
    return [...map.values()];
  }
}
