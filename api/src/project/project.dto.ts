import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class ProjectResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() ownerId!: string;
  @ApiProperty() name!: string;

  @ApiPropertyOptional({ nullable: true })
  description?: string | null;

  @ApiPropertyOptional({ nullable: true, example: '#4f46e5' })
  color?: string | null;

  @ApiProperty({ example: false })
  pinned!: boolean;

  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;

  @ApiPropertyOptional({ nullable: true })
  deletedAt?: Date | null;
}

export class CreateProjectDto {
  @ApiProperty({ minLength: 1, maxLength: 120, example: 'Team Dashboard' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  name!: string;

  @ApiPropertyOptional({
    maxLength: 2000,
    example: 'Internal dashboard for analytics and KPIs.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  description?: string;

  @ApiPropertyOptional({
    maxLength: 32,
    example: '#4f46e5',
    description: 'Optional hex color or token.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  color?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) =>
    typeof value === 'string' ? value === 'true' : !!value,
  )
  pinned?: boolean;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class ListProjectsQueryDto {
  @ApiPropertyOptional({
    description: 'Search by name/description',
    example: 'dash',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    default: false,
    description: 'Include archived (soft-deleted) projects',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return false;
    if (typeof value === 'boolean') return value;
    const v = String(value).trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(v)) return true;
    if (['false', '0', 'no', 'off'].includes(v)) return false;
    return false; // fallback
  })
  archived?: boolean = false;
}

export class SearchProjectsQueryDto {
  @ApiProperty({ description: 'Full-text query', example: 'dashboard' })
  @IsString()
  @MinLength(1)
  text!: string;

  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
