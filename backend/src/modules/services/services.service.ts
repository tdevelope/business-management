import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';


@Injectable()
export class ServicesService {
    
    constructor(private prisma: PrismaService) {}
    
    async getAllServices() {
        return await this.prisma.service.findMany();
    }

    async addService(dto: { name: string; duration: number; price: number }) {
        const service = await this.prisma.service.create({
            data: {
                name: dto.name,
                duration: dto.duration,
                price: dto.price,
            },
        });
        return service;
    }

    async updateService(dto: { id: number; name?: string; duration?: number; price?: number }) {    
        const service = await this.prisma.service.update({
            where: { id: dto.id },
            data: {
                name: dto.name,
                duration: dto.duration,
                price: dto.price,
            },
        });
        return service;
    }

    async deleteService(dto: { id: number }) {   
        const service = await this.prisma.service.delete({
            where: { id: dto.id },
        });
        return service;
    }
}