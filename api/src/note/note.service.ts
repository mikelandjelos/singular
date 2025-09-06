import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './note.entity';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note) private readonly repo: Repository<Note>,
  ) {}

  async findAll(): Promise<Note[]> {
    return this.repo.find({ relations: ['project', 'tags'] });
  }

  async findOne(id: string): Promise<Note | null> {
    return this.repo.findOne({ where: { id }, relations: ['project', 'tags'] });
  }

  async create(data: Partial<Note>): Promise<Note> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, patch: Partial<Note>): Promise<Note | null> {
    const entity = await this.findOne(id);
    if (!entity) return null;
    Object.assign(entity, patch);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
