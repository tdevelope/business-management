import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { GetAppointmentsByDateDto } from "./dto/get-appointments-by-date.dto";
import { CheckAvailabilityDto } from "./dto/check-availability.dto";
import { GetSuggestionsDto } from "./dto/get-suggestions.dto";


@Injectable()
export class AppointmentsService {
    constructor(private prisma: PrismaService) {}

    async createAppointment(dto: CreateAppointmentDto, userId: number) {
        const { serviceId, date, startTime } = dto;
        
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
                userId,
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

        const dayStart = new Date(date + "T00:00:00.000Z");
        const dayEnd = new Date(date + "T23:59:59.999Z");

        return this.prisma.appointment.findMany({
            where: { 
                startTime: {
                    gte: dayStart,
                    lte: dayEnd,
                }
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

    async getSuggestions(dto: GetSuggestionsDto) {
        const { serviceId, date, preferredTime } = dto;

        const service = await this.prisma.service.findUnique({
            where: { id: serviceId },
        });

        if (!service) throw new NotFoundException('Service not found');

        const duration = service.duration;

        const WORKING_DAYS = [0,1,2,3,4];
        const OPEN_TIME = "09:00";
        const CLOSE_TIME = "17:00";

        const dateObj = new Date(date);
        const dayOfWeek = dateObj.getDay();

        if (!WORKING_DAYS.includes(dayOfWeek)) {
            throw new BadRequestException('The business is closed on this day');
        }
        
        const openDate = new Date(`${date}T${OPEN_TIME}:00`);
        const closeDate = new Date(`${date}T${CLOSE_TIME}:00`);
        const appointments = await this.getForDate({ date });
        
        const busySlots = appointments
            .filter(a => a.startTime && a.endTime)
            .map(a => ({
                start: new Date(a.startTime),
                end: new Date(a.endTime),
            }))
            .sort((a, b) => a.start.getTime() - b.start.getTime());

        const freeSlots: { start: Date; end: Date }[] = [];
        let current = new Date(openDate);
        
        for (const slot of busySlots) {
            if (current < slot.start) {
                freeSlots.push({
                    start: new Date(current),
                    end: new Date(slot.start),
                });
            }
            if (slot.end > current) {
                current = new Date(slot.end);
            }
        }
        
        if (current < closeDate) {
            freeSlots.push({
                start: new Date(current),
                end: new Date(closeDate),
            });
        }
        
        const possibleSuggestions: { start: Date; end: Date }[] = [];

        for (const slot of freeSlots) {
            let t = new Date(slot.start);

            while (t.getTime() + duration * 60000 <= slot.end.getTime()) {
                possibleSuggestions.push({
                    start: new Date(t),
                    end: new Date(t.getTime() + duration * 60000),
                });

                t = new Date(t.getTime() + 15 * 60000);
            }
        }

        if (possibleSuggestions.length === 0) return [];

        const preferredDateTime = new Date(`${date}T${preferredTime}:00`);

        possibleSuggestions.sort(
            (a, b) =>
                Math.abs(a.start.getTime() - preferredDateTime.getTime()) -
                Math.abs(b.start.getTime() - preferredDateTime.getTime())
        );

        return possibleSuggestions.slice(0, 3);
    }

}