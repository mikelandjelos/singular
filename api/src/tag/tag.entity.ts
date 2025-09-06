import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity('tag')
@Unique(['userId', 'name'])
export class Tag {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() userId: string;
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' }) // IMPORTANT
  user: User;

  @Column() name: string;
  @Column({ nullable: true }) color?: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn({ nullable: true }) deletedAt: Date | null;
}
