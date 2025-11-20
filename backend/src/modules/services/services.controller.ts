import { Body, Controller, Delete, Get, Patch, Post } from "@nestjs/common";
import { ServicesService } from "./services.service";

@Controller('services')
export class ServicesController {
    constructor(private readonly servicesService: ServicesService) {}

    @Get()
    async getAllServices() {
        return this.servicesService.getAllServices();
    }

    @Post('add')
    async addService(@Body() dto: { name: string; duration: number; price: number }) {
        return this.servicesService.addService(dto);
    }

    @Patch('update')
    async updateService(@Body() dto: { id: number; name?: string; duration?: number; price?: number }) {
        return this.servicesService.updateService(dto);
    }

    @Delete('delete')
    async deleteService(@Body() dto: { id: number }) {
        return this.servicesService.deleteService(dto);
    }
}