import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { NoteService } from './note.service';
import { Note } from './note.entity';

@Controller('note')
export class NoteController {
  constructor(private readonly service: NoteService) {}

  @Get()
  async findAll(): Promise<Note[]> {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Note | null> {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() body: Partial<Note>): Promise<Note> {
    return this.service.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<Note>,
  ): Promise<Note | null> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
