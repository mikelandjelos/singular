import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Tag } from './tag.entity';

@Injectable()
export class TagService {
  private readonly logger = new Logger(TagService.name);

  constructor(
    @InjectRepository(Tag) private readonly tagRepo: Repository<Tag>,
  ) {}

  sanitize(t: Tag) {
    return {
      id: t.id,
      userId: t.userId,
      name: t.name,
      color: t.color ?? null,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      deletedAt: t.deletedAt ?? null,
    };
  }

  async findByIds(userId: string, ids: string[]): Promise<Tag[]> {
    if (!ids?.length) return [];
    return this.tagRepo.find({ where: { userId, id: In(ids) } });
  }

  async findOrCreateByNames(
    userId: string,
    names: string[] = [],
  ): Promise<Tag[]> {
    const cleaned = [
      ...new Set((names || []).map((s) => s.trim()).filter(Boolean)),
    ];
    if (!cleaned.length) return [];
    const existing = await this.tagRepo.find({
      where: { userId, name: In(cleaned) },
    });
    const have = new Set(existing.map((t) => t.name));
    const toCreate = cleaned
      .filter((n) => !have.has(n))
      .map((name) => this.tagRepo.create({ userId, name }));
    if (toCreate.length) await this.tagRepo.save(toCreate);
    return this.tagRepo.find({ where: { userId, name: In(cleaned) } });
  }

  async list(
    userId: string,
    p: { q?: string; offset?: number; limit?: number },
  ) {
    const offset = p.offset ?? 0;
    const limit = p.limit ?? 50;
    const qb = this.tagRepo
      .createQueryBuilder('t')
      .where('t.user_id = :userId', { userId });

    if (p.q?.trim()) {
      qb.andWhere('t.name ILIKE :s', { s: `%${p.q.trim()}%` })
        .orderBy('similarity(t.name, :q)', 'DESC')
        .addOrderBy('t.updated_at', 'DESC')
        .setParameter('q', p.q.trim());
    } else {
      qb.orderBy('t.updated_at', 'DESC');
    }

    qb.offset(offset).limit(limit);
    const [items, total] = await qb.getManyAndCount();
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

  /* Delete tags that are not used by any ACTIVE note */
  async pruneUnused(userId: string): Promise<number> {
    const res = await this.tagRepo
      .createQueryBuilder()
      .delete()
      .from(Tag)
      .where('user_id = :userId', { userId })
      .andWhere(
        `NOT EXISTS (
        SELECT 1 FROM note_tag nt
        JOIN note n ON n.id = nt.note_id
        WHERE nt.tag_id = tag.id AND n.deleted_at IS NULL
      )`,
      )
      .execute();
    return res.affected ?? 0;
  }
}
