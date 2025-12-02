import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(role?: string) {
    if (role) {
      return this.prisma.user.findMany({ where: { role } });
    }
    return this.prisma.user.findMany();
  }

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async addUser(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        email: dto.email,
        password: hashedPassword,
        role: dto.role || 'customer',
      },
    });
  }

  async updateUser(dto: { id: number } & UpdateUserDto, allowedFields?: string[]) {
    const { id, password, ...rest } = dto;

    // Filter fields if allowedFields is provided
    let data: any = allowedFields ? {} : { ...rest };
    if (allowedFields) {
      for (const key of allowedFields) {
        if (key in rest) data[key] = rest[key];
      }
    }

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
