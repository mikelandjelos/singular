import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { Tag } from './tag.entity';

@Controller('tag')
export class TagController {
  constructor(private readonly service: TagService) {}

  @Get()
  async findAll(): Promise<Tag[]> {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Tag | null> {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() body: Partial<Tag>): Promise<Tag> {
    return this.service.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<Tag>,
  ): Promise<Tag | null> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
