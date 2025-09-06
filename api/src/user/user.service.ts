import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(user: Partial<User>): Promise<User> {
    return this.repo.save(this.repo.create(user));
  }

  async update(id: string, patch: Partial<User>): Promise<User | null> {
    const u = await this.findOne(id);
    if (!u) return null;
    Object.assign(u, patch);
    return this.repo.save(u);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
