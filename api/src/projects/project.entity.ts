import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Unique,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('project')
@Unique(['userId', 'name'])
export class Project {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() userId: string;
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' }) // IMPORTANT
  user: User;

  @Column() name: string;
  @Column({ nullable: true }) description?: string;
  @Column({ nullable: true }) color?: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn({ nullable: true }) deletedAt: Date | null;
}
