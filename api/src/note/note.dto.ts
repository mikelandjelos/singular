import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Note } from './note.entity';
import { TagResponseDto } from '../tag/tag.dto';

export class NoteProjectDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ nullable: true }) color?: string | null;
}

export class NoteResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() userId!: string;

  @ApiProperty() title!: string;
  @ApiPropertyOptional({ nullable: true }) workDate?: string | null;
  @ApiProperty() content!: string;

  @ApiPropertyOptional({ type: NoteProjectDto, nullable: true })
  project?: NoteProjectDto | null;

  @ApiProperty({ type: [TagResponseDto] })
  tags!: TagResponseDto[];

  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;

  @ApiPropertyOptional({ nullable: true })
  deletedAt?: Date | null;
}

export class CreateNoteDto {
  @ApiProperty({ minLength: 1, maxLength: 200 })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  title!: string;

  @ApiPropertyOptional({ description: 'Optional ISO date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  workDate?: string;

  @ApiPropertyOptional({ description: 'Markdown content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Assign project by id', nullable: true })
  @IsOptional()
  @ValidateIf((o: Note) => o.projectId !== undefined)
  @IsUUID()
  projectId?: string | null;

  @ApiPropertyOptional({ type: [String], description: 'Attach by tag ids' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Attach by tag names (auto-create)',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((s: string) => s.trim()).filter(Boolean)
      : [],
  )
  tagNames?: string[];
}

export class UpdateNoteDto extends PartialType(CreateNoteDto) {}

export class ListNotesQueryDto {
  @ApiPropertyOptional({ description: 'Search title/content' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Filter by project ids (OR)',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }: { value: string[] }) =>
    Array.isArray(value) ? value : value ? String(value).split(',') : [],
  )
  projectIds?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Filter by tag ids (OR)',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }: { value: string[] }) =>
    Array.isArray(value) ? value : value ? String(value).split(',') : [],
  )
  tagIds?: string[];

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  offset?: number = 0;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    default: false,
    description:
      'If true, return only archived notes (deleted_at IS NOT NULL).',
  })
  @IsOptional()
  @Type(() => Boolean)
  archived?: boolean = false;
}
