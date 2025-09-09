import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('app_user') // "user" is reserved in Postgres
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;

  // local auth
  @Column({ unique: true }) email: string;
  @Column() passwordHash: string;

  // app display
  @Column({ unique: true }) displayName: string;

  // profile
  @Column({ nullable: true }) firstName?: string;
  @Column({ nullable: true }) lastName?: string;
  @Column({ nullable: true }) headline?: string;
  @Column({ nullable: true }) phone?: string;
  @Column({ nullable: true }) location?: string;
  @Column({ nullable: true }) website?: string;
  @Column({ type: 'text', nullable: true }) summaryMd?: string;
  @Column({ type: 'jsonb', nullable: true }) links?: Array<{
    label: string;
    url: string;
  }>;
  @Column({ type: 'jsonb', nullable: true }) skills?: string[];
  @Column({ type: 'jsonb', nullable: true }) languages?: string[];

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn({ nullable: true }) deletedAt: Date | null;
}
