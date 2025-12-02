import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, ForbiddenException } from "@nestjs/common";
import { ServicesService } from "./services.service";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller('services')
export class ServicesController {
    constructor(private readonly servicesService: ServicesService) {}

    private ensureAdmin(req: any) {
        if (req.user?.role !== 'admin') {
            throw new ForbiddenException('Admins only');
        }
    }

    @Get()
    getAllServices() {
        return this.servicesService.getAllServices();
    }

    @Post()
    addService(@Body() dto: CreateServiceDto, @Req() req) {
        this.ensureAdmin(req);
        return this.servicesService.addService(dto);
    }

    @Patch(':id')
    updateService(@Param('id') id: string, @Body() dto: UpdateServiceDto, @Req() req) {
        this.ensureAdmin(req);
        return this.servicesService.updateService({ id: Number(id), ...dto });
    }

    @Delete(':id')
    deleteService(@Param('id') id: string, @Req() req) {
        this.ensureAdmin(req);
        return this.servicesService.deleteService(Number(id));
    }
}
