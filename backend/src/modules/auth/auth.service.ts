import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {

    constructor(private jwtService: JwtService, private prisma: PrismaService) {}

    private generateToken(user: { id: number; email: string; role: string }) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const token = this.jwtService.sign(payload);
        return { token };
    }


    async register(dto: { name: string; email: string; password: string; role: string }) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existing) {
            throw new Error('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                password: hashedPassword,
                role: dto.role || 'customer',
            },
        });

        return this.generateToken(user);
    }

    async login(dto: { email: string; password: string }) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            throw new Error('User not found');
        }

        const isValid = await bcrypt.compare(dto.password, user.password);

        if (!isValid) {
            throw new Error('Invalid password');
        }
        
        return this.generateToken(user);
    }

}