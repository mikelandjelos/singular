import {
  Body,
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Query,
  ParseUUIDPipe,
  NotFoundException,
  UseGuards,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUserId } from 'src/auth/decorators/current-user-id.decorator';
import { TagService } from './tag.service';
import {
  CreateTagDto,
  ListTagsQueryDto,
  TagResponseDto,
  UpdateTagDto,
} from './tag.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './tag.entity';

@ApiTags('tags')
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard)
@Controller('tags')
export class TagController {
  constructor(
    private readonly tagService: TagService,
    @InjectRepository(Tag) private readonly tagRepo: Repository<Tag>,
  ) {}

  @ApiOperation({ summary: 'List/search tags' })
  @ApiOkResponse({
    schema: {
      example: { items: [], meta: { offset: 0, limit: 50, total: 0 } },
    },
  })
  @Get()
  async list(@CurrentUserId() userId: string, @Query() q: ListTagsQueryDto) {
    const res = await this.tagService.list(userId, q);
    return {
      items: res.items.map((t) => this.tagService.sanitize(t)),
      meta: res.meta,
    };
  }

  @ApiOperation({ summary: 'Create tag' })
  @ApiOkResponse({ type: TagResponseDto })
  @Post()
  async create(
    @CurrentUserId() userId: string,
    @Body() dto: CreateTagDto,
  ): Promise<TagResponseDto> {
    const exists = await this.tagRepo.findOne({
      where: { userId, name: dto.name },
    });
    if (exists) return this.tagService.sanitize(exists);
    const entity = this.tagRepo.create({
      userId,
      name: dto.name,
      color: dto.color,
    });
    const saved = await this.tagRepo.save(entity);
    return this.tagService.sanitize(saved);
  }

  @ApiOperation({ summary: 'Update tag' })
  @ApiParam({ name: 'id', description: 'Tag UUID' })
  @ApiOkResponse({ type: TagResponseDto })
  @ApiNotFoundResponse({ description: 'Tag not found' })
  @Put(':id')
  async update(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTagDto,
  ): Promise<TagResponseDto> {
    const tag = await this.tagRepo.findOne({ where: { id, userId } });
    if (!tag) throw new NotFoundException('Tag not found');
    tag.name = dto.name ?? tag.name;
    tag.color = dto.color ?? tag.color ?? null;
    const saved = await this.tagRepo.save(tag);
    return this.tagService.sanitize(saved);
  }

  @ApiOperation({
    summary: 'Delete tag (hard). Note: unused tags are auto-pruned as well.',
  })
  @ApiParam({ name: 'id', description: 'Tag UUID' })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  @Delete(':id')
  async hardDelete(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.tagRepo.delete({ id, userId });
    return { ok: true };
  }
}
