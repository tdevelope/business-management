import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {

    constructor(
        private jwtService: JwtService,
        private prisma: PrismaService
    ) {}

    private generateToken(user: { id: number; email: string; role: string }) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const token = this.jwtService.sign(payload);
        return { token };
    }


    async register(dto: RegisterDto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existing) {
            throw new BadRequestException('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                phone: dto.phone,
                password: hashedPassword,
                role: dto.role || 'customer',
            },
        });

        return this.generateToken(user);
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isValid = await bcrypt.compare(dto.password, user.password);

        if (!isValid) {
            throw new BadRequestException('Invalid password');
        }
        
        return this.generateToken(user);
    }

}