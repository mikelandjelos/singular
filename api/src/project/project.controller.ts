import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { Project } from './project.entity';

@Controller('project')
export class ProjectController {
  constructor(private readonly service: ProjectService) {}

  @Get()
  async findAll(): Promise<Project[]> {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Project | null> {
    return this.service.findOne(id);
  }
  u;
  @Post()
  async create(@Body() body: Partial<Project>): Promise<Project> {
    return this.service.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<Project>,
  ): Promise<Project | null> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
