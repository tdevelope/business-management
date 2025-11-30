import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AppointmentsService } from "./appointments.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { GetAppointmentsByDateDto } from "./dto/get-appointments-by-date.dto";
import { CheckAvailabilityDto } from "./dto/check-availability.dto";
import { GetSuggestionsDto } from "./dto/get-suggestions.dto";
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('appointments')
export class AppointmentsController {
    constructor(private readonly appointmentsService: AppointmentsService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async createAppointment(@Req() req, @Body() dto: CreateAppointmentDto) {
        const userId = req.user.id; 
        return this.appointmentsService.createAppointment(dto, userId);
    }

    @Get('date')
    async getAppointmentsByDate(@Query() dto: GetAppointmentsByDateDto) {
        return this.appointmentsService.getForDate(dto);
    }

    @Post('checkAvailability')
    async checkAvailability(@Body() dto: CheckAvailabilityDto) {
        return this.appointmentsService.checkAvailability(dto);
    }

    @Post('getSuggestions')
    async getSuggestions(@Body() dto: GetSuggestionsDto) {
        return this.appointmentsService.getSuggestions(dto);
    }

}