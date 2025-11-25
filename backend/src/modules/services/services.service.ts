import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';


@Injectable()
export class ServicesService {
    
    constructor(private prisma: PrismaService) {}
    
    async getAllServices() {
        return this.prisma.service.findMany();
    }

    async addService(dto: CreateServiceDto) {
        return this.prisma.service.create({ data: dto });
    }

    async updateService(dto: { id: number } & UpdateServiceDto) {
        return this.prisma.service.update({
            where: { id: dto.id },
            data: dto,
        });
    }

    async deleteService(id: number ) {   
        return this.prisma.service.delete({
            where: { id },
        });
    }
}