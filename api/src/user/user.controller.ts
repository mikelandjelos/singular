import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly users: UserService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.users.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User | null> {
    return this.users.findOne(id);
  }

  @Post()
  async create(@Body() body: Partial<User>): Promise<User> {
    return this.users.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<User>,
  ): Promise<User | null> {
    return this.users.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.users.remove(id);
  }
}
