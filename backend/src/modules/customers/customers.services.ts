import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
    
    constructor(private prisma: PrismaService) {}

    async getAllCustomers() {
        return this.prisma.customer.findMany();
    }

    async addCustomer(dto: CreateCustomerDto) {
        return this.prisma.customer.create({ data: dto });
    }

    async updateCustomer(dto: { id: number } & UpdateCustomerDto) {
        return this.prisma.customer.update({
            where: { id: dto.id },
            data: dto,
        });
    }

    async deleteCustomer(id: number ) {   
        return this.prisma.customer.delete({
            where: { id },
        });
    }
}

