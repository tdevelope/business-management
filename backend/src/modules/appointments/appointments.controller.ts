import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { AppointmentsService } from "./appointments.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { GetAppointmentsByDateDto } from "./dto/get-appointments-by-date.dto";
import { CheckAvailabilityDto } from "./dto/check-availability.dto";
import { GetSuggestionsDto } from "./dto/get-suggestions.dto";

@Controller('appointments')
export class AppointmentsController {
    constructor(private readonly appointmentsService: AppointmentsService) {}

    @Post()
    async createAppointment(@Body() dto: CreateAppointmentDto) {
        return this.appointmentsService.createAppointment(dto);
    }

    @Get('date')
    async getAppointmentsByDate(@Query() dto: GetAppointmentsByDateDto) {
        return this.appointmentsService.getForDate(dto);
    }

    @Post('check')
    async checkAvailability(@Body() dto: CheckAvailabilityDto) {
        return this.appointmentsService.checkAvailability(dto);
    }

    @Post('suggestions')
    async getSuggestions(@Body() dto: GetSuggestionsDto) {
        return this.appointmentsService.getSuggestions(dto);
    }

}