import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';


@Injectable()
export class ServicesService {
    
    constructor(private prisma: PrismaService) {}
    
    async getAllServices() {
        return this.prisma.service.findMany();
    }

    async addService(dto: { name: string; duration: number; price: number }) {
        return this.prisma.service.create({ data: dto });
    }

    async updateService(dto: { id: number; name?: string; duration?: number; price?: number }) {
        return this.prisma.service.update({
            where: { id: dto.id },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.duration !== undefined && { duration: dto.duration }),
                ...(dto.price !== undefined && { price: dto.price }),
            },
        });
    }

    async deleteService(id: number ) {   
        return this.prisma.service.delete({
            where: { id },
        });
    }
}