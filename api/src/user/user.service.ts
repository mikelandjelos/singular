import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from './user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  sanitize(user: User): Omit<User, 'passwordHash'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safe } = user;
    return safe;
  }

  async create(
    data: {
      email: string;
      password: string;
      displayName: string;
    } & Partial<Pick<User, 'firstName' | 'lastName'>>,
  ): Promise<User> {
    const passwordHash = await argon2.hash(data.password);

    const user = this.userRepository.create({
      email: data.email,
      displayName: data.displayName,
      firstName: data.firstName,
      lastName: data.lastName,
      passwordHash,
    });
    this.logger.debug(`Created user: ${JSON.stringify(user)}`);

    return this.userRepository.save(user);
  }

  findAll(offset: number = 0, limit: number = 25): Promise<User[]> {
    return this.userRepository.find({
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.userRepository.findOne({ where: { email } });
    return user;
  }

  search(searchedText: string, offset = 0, limit = 25) {
    const p = `%${searchedText}%`;

    return this.userRepository
      .createQueryBuilder('u')
      .where(`"display_name"  ILIKE :p`, { p })
      .orWhere(`"first_name"  ILIKE :p`, { p })
      .orWhere(`"last_name"   ILIKE :p`, { p })
      .orderBy(
        `GREATEST(
        similarity("display_name",  :q),
        similarity("first_name",    :q),
        similarity("last_name",     :q)
      )`,
        'DESC',
      )
      .setParameters({ q: searchedText })
      .offset(offset)
      .limit(limit)
      .getMany();
  }

  async update(
    id: string,
    patchedProps: Partial<
      Pick<
        User,
        | 'displayName'
        | 'firstName'
        | 'lastName'
        | 'headline'
        | 'phone'
        | 'location'
        | 'website'
        | 'summaryMd'
        | 'links'
        | 'skills'
        | 'languages'
      >
    >,
  ): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;
    return await this.userRepository.save({ id, ...patchedProps });
  }

  async softDelete(id: string) {
    const res = await this.userRepository.softDelete({ id });
    return res.affected;
  }
}
