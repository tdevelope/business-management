import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { GetAppointmentsByDateDto } from "./dto/get-appointments-by-date.dto";
import { CheckAvailabilityDto } from "./dto/check-availability.dto";

@Injectable()
export class AppointmentsService {
    constructor(private prisma: PrismaService) {}

    async createAppointment(dto: CreateAppointmentDto) {
        const { customerId, serviceId, date, startTime } = dto;
        
        const service = await this.prisma.service.findUnique({
            where: { id: serviceId },
        });

        if (!service) {
            throw new NotFoundException('Service not found');
        }

        const start = new Date(`${date}T${startTime}:00`);
        const end = new Date(start.getTime() + service.duration * 60000);

        const isAvailable = await this.checkAvailability({
            serviceId,
            date,
            startTime,
        });

        if (!isAvailable) {
            throw new BadRequestException('This time slot is not available');
        }

        return this.prisma.appointment.create({
            data: {
            customerId,
            serviceId,
            date: new Date(date),
            startTime: start,
            endTime: end,
            status: 'scheduled',
            },
        });
    }

    async getForDate(dto: GetAppointmentsByDateDto) {
    const { date } = dto;

    return this.prisma.appointment.findMany({
        where: {
        date: new Date(date),
        },
        orderBy: {
        startTime: 'asc',
        },
    });
    }


    async checkAvailability(dto: CheckAvailabilityDto): Promise<boolean> {
        const { serviceId, date, startTime } = dto;

        const service = await this.prisma.service.findUnique({
            where: { id: serviceId },
        });

        if (!service) return false;

        const start = new Date(`${date}T${startTime}:00`);
        const end = new Date(start.getTime() + service.duration * 60000);

        const appointments = await this.getForDate({ date });

        const overlap = appointments.some((a) => {
            return start < a.endTime && end > a.startTime;
        });

        return !overlap;
    }
}