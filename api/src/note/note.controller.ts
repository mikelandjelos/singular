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
  Patch,
  ConflictException,
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
import { NoteService } from './note.service';
import {
  CreateNoteDto,
  ListNotesQueryDto,
  NoteResponseDto,
  UpdateNoteDto,
} from './note.dto';

@ApiTags('notes')
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @ApiOperation({ summary: 'Create note' })
  @ApiOkResponse({ type: NoteResponseDto })
  @Post()
  async create(
    @CurrentUserId() userId: string,
    @Body() dto: CreateNoteDto,
  ): Promise<NoteResponseDto> {
    const res = await this.noteService.create(userId, {
      title: dto.title,
      content: dto.content ?? '',
      workDate: dto.workDate ?? null,
      projectId: dto.projectId ?? null,
      tagIds: dto.tagIds,
      tagNames: dto.tagNames,
    });
    if (!res.ok) {
      if (res.reason === 'bad_project')
        throw new ConflictException('Project not found or not yours');
      throw new ConflictException('Could not create note');
    }
    return this.noteService.sanitize(res.note);
  }

  @ApiOperation({ summary: 'List notes (filters + pagination)' })
  @ApiOkResponse({
    schema: {
      example: {
        items: [],
        meta: {
          offset: 0,
          limit: 20,
          total: 0,
          hasNext: false,
          hasPrev: false,
        },
      },
    },
  })
  @Get()
  async list(@CurrentUserId() userId: string, @Query() q: ListNotesQueryDto) {
    const res = await this.noteService.listOffset(userId, {
      q: q.q,
      projectIds: q.projectIds,
      tagIds: q.tagIds,
      offset: q.offset,
      limit: q.limit,
      archived: q.archived,
    });
    return {
      items: res.items.map((n) => this.noteService.sanitize(n)),
      meta: res.meta,
    };
  }

  @ApiOperation({ summary: 'Get note by id' })
  @ApiParam({ name: 'id', description: 'Note UUID' })
  @ApiOkResponse({ type: NoteResponseDto })
  @ApiNotFoundResponse({ description: 'Note not found' })
  @Get(':id')
  async getById(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NoteResponseDto> {
    const found = await this.noteService.findById(userId, id);
    if (!found) throw new NotFoundException('Note not found');
    return this.noteService.sanitize(found);
  }

  @ApiOperation({ summary: 'Update note' })
  @ApiParam({ name: 'id', description: 'Note UUID' })
  @ApiOkResponse({ type: NoteResponseDto })
  @ApiNotFoundResponse({ description: 'Note not found' })
  @Put(':id')
  async update(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNoteDto,
  ): Promise<NoteResponseDto> {
    const res = await this.noteService.update(userId, id, {
      title: dto.title,
      content: dto.content,
      workDate: dto.workDate,
      projectId: dto.projectId,
      tagIds: dto.tagIds,
      tagNames: dto.tagNames,
    });
    if (!res.ok) {
      if (res.reason === 'bad_project')
        throw new ConflictException('Project not found or not yours');
      throw new NotFoundException('Note not found');
    }
    return this.noteService.sanitize(res.note);
  }

  @ApiOperation({ summary: 'Archive note (soft delete)' })
  @ApiParam({ name: 'id', description: 'Note UUID' })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  @ApiNotFoundResponse({ description: 'Note not found' })
  @Delete(':id')
  async remove(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const affected = await this.noteService.softDelete(userId, id);
    if (!affected) throw new NotFoundException('Note not found');
    return { ok: true };
  }

  @ApiOperation({ summary: 'Restore archived note' })
  @ApiParam({ name: 'id', description: 'Note UUID' })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  @ApiNotFoundResponse({ description: 'Note not found' })
  @Patch(':id/restore')
  async restore(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const affected = await this.noteService.restore(userId, id);
    if (!affected) throw new NotFoundException('Note not found');
    return { ok: true };
  }

  @ApiOperation({ summary: 'Hard delete note (irreversible)' })
  @ApiParam({ name: 'id', description: 'Note UUID' })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  @Delete(':id/hard')
  async hardDelete(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.noteService.hardDelete(userId, id);
    return { ok: true };
  }
}
