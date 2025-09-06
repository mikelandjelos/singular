import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './tag.entity';

@Injectable()
export class TagService {
  constructor(@InjectRepository(Tag) private readonly repo: Repository<Tag>) {}

  async findAll(): Promise<Tag[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<Tag | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<Tag>): Promise<Tag> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, patch: Partial<Tag>): Promise<Tag | null> {
    const entity = await this.findOne(id);
    if (!entity) return null;
    Object.assign(entity, patch);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
