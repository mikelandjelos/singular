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
import { User } from '../user/user.entity';
import { Project } from '../project/project.entity';
import { Tag } from '../tag/tag.entity';

@Entity('note')
@Index('idx_note_user_date', ['userId', 'workDate'])
export class Note {
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
    name: 'note_tag',
    joinColumn: { name: 'note_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn({ nullable: true }) deletedAt: Date | null;
}
