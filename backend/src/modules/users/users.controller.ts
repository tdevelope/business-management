import {
  Controller,
  Get,
  Param,
  Body,
  Patch,
  Post,
  Delete,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private ensureAdmin(req: any) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Admins only');
    }
  }

  @Get()
  getAllUsers(@Req() req, @Query('role') role?: string) {
    this.ensureAdmin(req);
    return this.usersService.getAllUsers(role);
  }

  @Get('me')
  getMe(@Req() req) {
    const { password, ...safeUser } = req.user;
    return safeUser;
  }

  @Post()
  addUser(@Body() dto: CreateUserDto, @Req() req) {
    this.ensureAdmin(req);
    return this.usersService.addUser(dto);
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req,
  ) {
    const userId = Number(id);

    if (req.user.role === 'admin') {
      return this.usersService.updateUser({ id: userId, ...dto });
    }

    if (req.user.id !== userId) {
      throw new ForbiddenException('Cannot update other users');
    }

    const { role, ...allowedFields } = dto;
    return this.usersService.updateUser({ id: userId, ...allowedFields });
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string, @Req() req) {
    this.ensureAdmin(req);
    return this.usersService.deleteUser(Number(id));
  }
}
