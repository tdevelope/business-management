import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ServicesService } from "./services.service";

@Controller('services')
export class ServicesController {
    constructor(private readonly servicesService: ServicesService) {}

    @Get()
    async getAllServices() {
        return this.servicesService.getAllServices();
    }

    @Post()
    async addService(@Body() dto: { name: string; duration: number; price: number }) {
        return this.servicesService.addService(dto);
    }

    @Patch(':id')
    async updateService(@Param('id') id: string, @Body() dto: { name?: string; duration?: number; price?: number }) {
        return this.servicesService.updateService({ id: Number(id), ...dto });
    }

    @Delete(':id')
    async deleteService(@Param('id') id: string) {
        return this.servicesService.deleteService(Number(id));
    }
}