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
  ApiQuery,
  ApiCookieAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUserId } from 'src/auth/decorators/current-user-id.decorator';
import { ProjectService } from './project.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ListProjectsQueryDto,
  SearchProjectsQueryDto,
  ProjectResponseDto,
} from './project.dto';

@ApiTags('projects')
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiOperation({ summary: 'Create project' })
  @ApiOkResponse({ type: ProjectResponseDto })
  @Post()
  async create(
    @CurrentUserId() ownerId: string,
    @Body() dto: CreateProjectDto,
  ): Promise<ProjectResponseDto> {
    const createdProject = await this.projectService.create(ownerId, {
      name: dto.name,
      description: dto.description,
      color: dto.color,
      pinned: dto.pinned,
    });
    if (!createdProject) {
      throw new ConflictException('Project with this name already exists');
    }
    return this.projectService.sanitize(createdProject);
  }

  @ApiOperation({ summary: 'List projects (paginated, owner-scoped)' })
  @ApiOkResponse({
    schema: {
      example: { items: [], meta: { offset: 0, limit: 20, total: 0 } },
    },
  })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'archived', required: false, type: Boolean })
  @Get()
  async getAll(
    @CurrentUserId() ownerId: string,
    @Query() q: ListProjectsQueryDto,
  ) {
    const res = await this.projectService.listOffset(ownerId, {
      q: q.q,
      offset: q.offset,
      limit: q.limit,
      archived: q.archived,
    });
    return {
      items: res.items.map((p) => this.projectService.sanitize(p)),
      meta: res.meta,
    };
  }

  @ApiOperation({ summary: 'Search projects by name' })
  @ApiOkResponse({ type: ProjectResponseDto, isArray: true })
  @ApiQuery({ name: 'text', required: true, type: String })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get('search')
  async search(
    @CurrentUserId() ownerId: string,
    @Query() q: SearchProjectsQueryDto,
  ): Promise<ProjectResponseDto[]> {
    const rows = await this.projectService.search(
      ownerId,
      q.text,
      q.offset,
      q.limit,
    );
    return rows.map((p) => this.projectService.sanitize(p));
  }

  @ApiOperation({ summary: 'Get project by id' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiOkResponse({ type: ProjectResponseDto })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @Get(':id')
  async getById(
    @CurrentUserId() ownerId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProjectResponseDto> {
    const found = await this.projectService.findById(ownerId, id);
    if (!found) throw new NotFoundException('Project not found');
    return this.projectService.sanitize(found);
  }

  @ApiOperation({ summary: 'Update project' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiOkResponse({ type: ProjectResponseDto })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @Put(':id')
  async update(
    @CurrentUserId() ownerId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    const updateResult = await this.projectService.update(ownerId, id, {
      name: dto.name,
      description: dto.description,
      color: dto.color,
      pinned: dto.pinned,
    });
    if (!updateResult.ok) {
      const { reason } = updateResult;
      if (reason === 'conflict')
        throw new ConflictException('Project with this name already exists');
      throw new NotFoundException('Project not found');
    }
    return this.projectService.sanitize(updateResult.project);
  }

  @ApiOperation({ summary: 'Archive project (soft delete)' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @Delete(':id')
  async remove(
    @CurrentUserId() ownerId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const affected = await this.projectService.softDelete(ownerId, id);
    if (!affected) throw new NotFoundException('Project not found');
    return { ok: true };
  }

  @ApiOperation({ summary: 'Restore archived project' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @Patch(':id/restore')
  async restore(
    @CurrentUserId() ownerId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const affected = await this.projectService.restore(ownerId, id);
    if (!affected) throw new NotFoundException('Project not found');
    return { ok: true };
  }

  @ApiOperation({ summary: 'Pin or unpin a project' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { pinned: { type: 'boolean', example: true } },
      required: ['pinned'],
    },
  })
  @ApiOkResponse({ type: ProjectResponseDto })
  @Patch(':id/pin')
  async pin(
    @CurrentUserId() ownerId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('pinned') pinned: boolean,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectService.setPinned(ownerId, id, !!pinned);
    if (!project) throw new NotFoundException('Project not found');
    return this.projectService.sanitize(project);
  }

  @ApiOperation({ summary: 'Hard delete project (irreversible)' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  @Delete(':id/hard')
  async hardDelete(
    @CurrentUserId() ownerId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.projectService.hardDelete(ownerId, id);
    return { ok: true };
  }
}
