import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class TagResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() userId!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ nullable: true }) color?: string | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
  @ApiPropertyOptional({ nullable: true }) deletedAt?: Date | null;
}

export class CreateTagDto {
  @ApiProperty({ minLength: 1, maxLength: 80 })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  name!: string;

  @ApiPropertyOptional({ maxLength: 32, example: '#10b981' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  color?: string;
}

export class UpdateTagDto extends PartialType(CreateTagDto) {}

export class ListTagsQueryDto {
  @ApiPropertyOptional({ description: 'Search by name' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  offset?: number = 0;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  limit?: number = 50;
}
