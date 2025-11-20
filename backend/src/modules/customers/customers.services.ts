import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomersService {
    
    constructor(private prisma: PrismaService) {}

    async getAllCustomers() {
        return this.prisma.customer.findMany();
    }

    async addCustomer(dto: { name: string; phone: string }) {
        return this.prisma.customer.create({ data: dto });
    }

    async updateCustomer(dto: { id: number; name?: string; phone?: string }) {
        return this.prisma.customer.update({
            where: { id: dto.id },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.phone !== undefined && { phone: dto.phone }),
            },
        });
    }

    async deleteCustomer(id: number ) {   
        return this.prisma.customer.delete({
            where: { id },
        });
    }
}

