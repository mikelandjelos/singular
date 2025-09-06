import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project) private readonly repo: Repository<Project>,
  ) {}

  async findAll(): Promise<Project[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<Project | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<Project>): Promise<Project> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, patch: Partial<Project>): Promise<Project | null> {
    const entity = await this.findOne(id);
    if (!entity) return null;
    Object.assign(entity, patch);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
