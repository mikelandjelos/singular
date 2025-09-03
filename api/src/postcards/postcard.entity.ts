import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinTable,
  ManyToMany,
  DeleteDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';
import { Tag } from '../tags/tag.entity';

@Entity('postcard')
@Index('idx_postcard_user_date', ['userId', 'workDate'])
export class Postcard {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() userId: string;
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' }) // IMPORTANT
  user: User;

  @Column({ nullable: true }) projectId?: string;
  @ManyToOne(() => Project, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'projectId' }) // IMPORTANT
  project?: Project | null;

  @Column({ type: 'date' }) workDate: string;
  @Column({ type: 'text' }) content: string;

  @ManyToMany(() => Tag, { cascade: false })
  @JoinTable({
    name: 'postcard_tag',
    joinColumn: { name: 'postcard_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn({ nullable: true }) deletedAt: Date | null;
}
