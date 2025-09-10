import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { UserService } from 'src/user/user.service';

export type UpdateProjectResult =
  | { ok: true; project: Project }
  | { ok: false; reason: 'not_found' | 'conflict' };

export type ListProjectsParams = {
  q?: string;
  offset?: number;
  limit?: number;
  archived?: boolean;
};

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly userService: UserService,
  ) {}

  sanitize(p: Project) {
    return {
      id: p.id,
      ownerId: p.ownerId,
      name: p.name,
      description: p.description ?? null,
      color: p.color ?? null,
      pinned: !!p.pinned,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      deletedAt: p.deletedAt ?? null,
    };
  }

  async create(
    ownerId: string,
    newProject: { name: Project['name'] } & Partial<
      Pick<Project, 'description' | 'color' | 'pinned'>
    >,
  ): Promise<Project | null> {
    const owner = await this.userService.findById(ownerId);

    if (!owner) {
      this.logger.error(`No user with ID '${ownerId}'`);
      return null;
    }

    const dup = await this.projectRepository.exists({
      where: { ownerId, name: newProject.name },
      withDeleted: true,
    });

    if (dup) {
      this.logger.error(
        `Cannot create a project with duplicate name '${newProject.name}'`,
      );
      return null;
    }

    const projectEntity = this.projectRepository.create({
      owner,
      name: newProject.name,
      description: newProject.description,
      color: newProject.color,
      pinned: !!newProject.pinned,
    });

    const project = await this.projectRepository.save(projectEntity);
    return project;
  }

  async listOffset(
    ownerId: string,
    p: ListProjectsParams,
  ): Promise<{
    items: Project[];
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
    const includeArchived = !!p.archived;
    const search = p.q?.trim();

    const qb = this.projectRepository
      .createQueryBuilder('p')
      .where('p.owner_id = :ownerId', { ownerId });

    if (includeArchived) {
      qb.withDeleted(); // active and archived
    } else {
      qb.andWhere('p.deleted_at IS NULL'); // only active
    }

    if (search) {
      qb.andWhere('(p.name ILIKE :s OR p.description ILIKE :s)', {
        s: `%${search}%`,
      });
    }

    qb.orderBy('p.pinned', 'DESC')
      .addOrderBy('p.updated_at', 'DESC')
      .offset(offset)
      .limit(limit);

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

  async search(
    ownerId: string,
    text: string,
    offset = 0,
    limit = 20,
  ): Promise<Project[]> {
    const s = (text ?? '').trim();
    if (!s) return [];

    return this.projectRepository
      .createQueryBuilder('p')
      .where('p.owner_id = :ownerId', { ownerId })
      .andWhere('p.deleted_at IS NULL')
      .andWhere('(p.name ILIKE :s OR p.description ILIKE :s)', { s: `%${s}%` })
      .orderBy('p.pinned', 'DESC')
      .addOrderBy('p.updated_at', 'DESC')
      .offset(offset)
      .limit(limit)
      .getMany();
  }

  async findById(ownerId: string, id: string): Promise<Project | null> {
    return this.projectRepository.findOne({
      where: { id, ownerId },
      withDeleted: true,
    });
  }

  async update(
    ownerId: string,
    id: string,
    patch: Partial<Pick<Project, 'name' | 'description' | 'color' | 'pinned'>>,
  ): Promise<UpdateProjectResult> {
    const current = await this.findById(ownerId, id);
    if (!current) return { ok: false, reason: 'not_found' };

    if (
      typeof patch.name === 'string' &&
      patch.name.trim() &&
      patch.name !== current.name
    ) {
      const duplicate = await this.projectRepository.exists({
        where: { ownerId, name: patch.name },
        withDeleted: true,
      });
      if (duplicate) return { ok: false, reason: 'conflict' };
    }

    Object.assign(current, patch);
    const project = await this.projectRepository.save(current);
    return { ok: true, project };
  }

  async setPinned(
    ownerId: string,
    id: string,
    pinned: boolean,
  ): Promise<Project | null> {
    const project = await this.findById(ownerId, id);
    if (!project) return null;
    project.pinned = !!pinned;

    this.logger.debug(pinned);
    this.logger.debug(project.pinned);
    const result = await this.projectRepository.save(project);
    return result;
  }

  async softDelete(ownerId: string, id: string): Promise<number> {
    const res = await this.projectRepository.softDelete({ id, ownerId });
    return res.affected ?? 0;
  }

  async restore(ownerId: string, id: string): Promise<number> {
    const res = await this.projectRepository.restore({ id, ownerId });
    return res.affected ?? 0;
  }

  async hardDelete(ownerId: string, id: string): Promise<void> {
    await this.projectRepository.delete({ id, ownerId });
  }
}
