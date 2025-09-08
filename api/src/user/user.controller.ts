import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiCookieAuth,
  // ApiBearerAuth,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import {
  CreateUserDto,
  UpdateUserDto,
  ListUsersQueryDto,
  GetByEmailParamDto,
  SearchUsersQueryDto,
  UserResponseDto,
} from './user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@ApiTags('users')
// @ApiBearerAuth()
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Create user' })
  @ApiCreatedResponse({ type: UserResponseDto })
  @Post()
  async create(@Body() newUser: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.create(newUser);
    return this.userService.sanitize(user);
  }

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

  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const updated = await this.userService.update(id, dto);
    if (!updated) throw new NotFoundException('User not found');
    return this.userService.sanitize(updated);
  }

  @ApiOperation({ summary: 'Soft delete user' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const affected = await this.userService.softDelete(id);
    if (!affected) throw new NotFoundException('User not found');
    return { ok: true };
  }
}
