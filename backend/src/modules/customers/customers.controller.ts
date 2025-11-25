import { Controller, Get,  Param, Body, Patch, Post, Delete } from "@nestjs/common";
import { CustomersService } from "./customers.services";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";

@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Get()
    async getAllCustomers() {
        return this.customersService.getAllCustomers();
    }

    @Post()
    async addCustomer(@Body() dto: CreateCustomerDto) {
        return this.customersService.addCustomer(dto);
    }

    @Patch(':id')
    async updateCustomer(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
        return this.customersService.updateCustomer({ id: Number(id), ...dto });
    }

    @Delete(':id')
    async deleteCustomer(@Param('id') id: string) {
        return this.customersService.deleteCustomer(Number(id));
    }
}