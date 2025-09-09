import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  NotFoundException,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import {
  UpdateUserDto,
  ListUsersQueryDto,
  GetByEmailParamDto,
  SearchUsersQueryDto,
  UserResponseDto,
} from './user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUserId } from 'src/auth/decorators/current-user-id.decorator';

@ApiTags('users')
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'List users' })
  @ApiOkResponse({ type: UserResponseDto, isArray: true })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get()
  async getAll(
    @Query() listUsersQuery: ListUsersQueryDto,
  ): Promise<UserResponseDto[]> {
    const rows = await this.userService.findAll(
      listUsersQuery.offset,
      listUsersQuery.limit,
    );
    return rows.map((u) => this.userService.sanitize(u));
  }

  @ApiOperation({ summary: 'Full-text search users' })
  @ApiOkResponse({ type: UserResponseDto, isArray: true })
  @ApiQuery({ name: 'text', required: true, type: String })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get('search')
  async search(
    @Query() searchUsersQuery: SearchUsersQueryDto,
  ): Promise<UserResponseDto[]> {
    const rows = await this.userService.search(
      searchUsersQuery.text,
      searchUsersQuery.offset,
      searchUsersQuery.limit,
    );
    return rows.map((u) => this.userService.sanitize(u));
  }

  @ApiOperation({ summary: 'Get user by email' })
  @ApiParam({ name: 'email', description: 'Email address' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Get('email/:email')
  async getByEmail(
    @Param() getByEmailParams: GetByEmailParamDto,
  ): Promise<UserResponseDto> {
    const found = await this.userService.findByEmail(getByEmailParams.email);
    if (!found) throw new NotFoundException(`User not found`);
    return this.userService.sanitize(found);
  }

  @ApiOperation({ summary: 'Get user by id' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Get(':id')
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    const found = await this.userService.findById(id);
    if (!found) throw new NotFoundException(`User not found`);
    return this.userService.sanitize(found);
  }

  @ApiOperation({ summary: 'Update self' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Patch(':id')
  async update(
    @CurrentUserId() myId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    console.log(myId);
    if (myId !== id)
      throw new ForbiddenException(`User ${myId} cannot update user ${id}!`);
    const updated = await this.userService.update(id, dto);
    if (!updated) throw new NotFoundException('User not found');
    return this.userService.sanitize(updated);
  }

  @ApiOperation({ summary: 'Soft delete self' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Delete(':id')
  async remove(
    @CurrentUserId() myId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    console.log(myId);
    if (myId !== id)
      throw new ForbiddenException(
        `User ${myId} cannot soft delete user ${id}!`,
      );
    const affected = await this.userService.softDelete(id);
    if (!affected) throw new NotFoundException('User not found');
    return { ok: true };
  }

  @ApiOperation({ summary: 'Restore self (after self-deletion)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Patch('restore/:id')
  async restore(
    @CurrentUserId() myId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    console.log(myId);
    if (myId !== id)
      throw new ForbiddenException(`User ${myId} cannot restore user ${id}!`);
    const affected = await this.userService.restore(id);
    if (!affected) throw new NotFoundException('User not found');
    return { ok: true };
  }

  @ApiOperation({ summary: 'Hard delete self (irreversible)' })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  @Delete('hard/:id')
  async hardDelete(
    @CurrentUserId() myId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    if (myId !== id)
      throw new ForbiddenException(
        `User ${myId} cannot hard delete user ${id}!`,
      );
    await this.userService.hardDelete(id);
    return { ok: true };
  }
}
