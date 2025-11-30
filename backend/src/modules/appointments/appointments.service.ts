import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { GetAppointmentsByDateDto } from "./dto/get-appointments-by-date.dto";
import { CheckAvailabilityDto } from "./dto/check-availability.dto";
import { GetSuggestionsDto } from "./dto/get-suggestions.dto";


@Injectable()
export class AppointmentsService {
    constructor(private prisma: PrismaService) { }

    async createAppointment(dto: CreateAppointmentDto, userId: number) {
        const { serviceId, date, startTime } = dto;

        const service = await this.prisma.service.findUnique({
            where: { id: serviceId },
        });

        if (!service) {
            throw new NotFoundException('Service not found');
        }

        const [y, m, d] = date.split('-').map(Number);
        const [hh, mm] = startTime.split(':').map(Number);
        const start = new Date(y, m - 1, d, hh, mm);
        const end = new Date(start.getTime() + service.duration * 60000);

        if (start < new Date()) {
            throw new BadRequestException("Cannot book an appointment in the past");
        }

        const MAX_DAYS = 90;
        const diffDays = (start.getTime() - Date.now()) / (1000 * 60 * 60 * 24);

        if (diffDays > MAX_DAYS) {
            throw new BadRequestException(
                `Cannot book more than ${MAX_DAYS} days in advance`
            );
        }

        const isAvailable = await this.checkAvailability({
            serviceId,
            date,
            startTime,
        });

        if (!isAvailable) {
            throw new BadRequestException('This time slot is not available');
        }
        
        const pureDate = new Date(y, m - 1, d);

        return this.prisma.appointment.create({
            data: {
                userId,
                serviceId,
                date: pureDate,
                startTime: start,
                endTime: end,
                status: 'scheduled',
            },
        });
    }

    async getForDate(dto: GetAppointmentsByDateDto) {
        const { date } = dto;

        const [y, m, d] = date.split('-').map(Number);
        const dayStart = new Date(y, m - 1, d, 0, 0, 0);
        const dayEnd = new Date(y, m - 1, d, 23, 59, 59, 999);

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

        const [y, m, d] = date.split('-').map(Number);
        const [hh, mm] = startTime.split(':').map(Number);
        const start = new Date(y, m - 1, d, hh, mm); const end = new Date(start.getTime() + service.duration * 60000);

        const appointments = await this.getForDate({ date });

        const overlap = appointments.some((a) => {
            return start < a.endTime && end > a.startTime;
        });

        return !overlap;
    }

    async getSuggestions(dto: GetSuggestionsDto) {
        const { serviceId, date, preferredTime } = dto;

        // --- Parse preferred datetime as LOCAL ---
        const [y, m, d] = date.split('-').map(Number);
        const [hh, mm] = preferredTime.split(':').map(Number);
        const preferredDateTime = new Date(y, m - 1, d, hh, mm);

        // --- Basic validations ---
        const now = new Date();
        const MAX_DAYS = 90;
        const diffDays = (preferredDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

        if (preferredDateTime < now) {
            throw new BadRequestException("Cannot generate suggestions for a past date");
        }

        if (diffDays > MAX_DAYS) {
            throw new BadRequestException(
                `Cannot generate suggestions more than ${MAX_DAYS} days in advance`
            );
        }

        // --- Service lookup ---
        const service = await this.prisma.service.findUnique({
            where: { id: serviceId },
        });
        if (!service) throw new NotFoundException('Service not found');

        const duration = service.duration;

        // --- Business schedule ---
        const WORKING_DAYS = [0, 1, 2, 3, 4];
        const OPEN_TIME = "09:00";
        const CLOSE_TIME = "17:00";

        const dateObj = new Date(y, m - 1, d);
        const dayOfWeek = dateObj.getDay();
        if (!WORKING_DAYS.includes(dayOfWeek)) {
            throw new BadRequestException('The business is closed on this day');
        }

        // --- Parse local open/close times ---
        const [openH, openM] = OPEN_TIME.split(':').map(Number);
        const openDate = new Date(y, m - 1, d, openH, openM);

        const [closeH, closeM] = CLOSE_TIME.split(':').map(Number);
        const closeDate = new Date(y, m - 1, d, closeH, closeM);

        // --- Get existing appointments (already LOCAL) ---
        const appointments = await this.getForDate({ date });

        const busySlots = appointments
            .filter(a => a.startTime && a.endTime)
            .map(a => ({
                start: new Date(a.startTime),
                end: new Date(a.endTime),
            }))
            .sort((a, b) => a.start.getTime() - b.start.getTime());

        // --- Find free windows ---
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

        // --- Build all possible suggestions ---
        const possibleSuggestions: { start: Date; end: Date }[] = [];

        for (const slot of freeSlots) {
            let t = new Date(slot.start);

            while (t.getTime() + duration * 60000 <= slot.end.getTime()) {
                const suggestionStart = new Date(t);
                const suggestionEnd = new Date(t.getTime() + duration * 60000);

                possibleSuggestions.push({
                    start: suggestionStart,
                    end: suggestionEnd,
                });

                t = new Date(t.getTime() + 15 * 60000); // move 15 min
            }
        }

        if (possibleSuggestions.length === 0) return [];

        // --- Filter out suggestions from the past (important!) ---
        const futureSuggestions = possibleSuggestions.filter(s => s.start >= now);
        if (futureSuggestions.length === 0) return [];

        // --- Sort best matches ---
        futureSuggestions.sort(
            (a, b) =>
                Math.abs(a.start.getTime() - preferredDateTime.getTime()) -
                Math.abs(b.start.getTime() - preferredDateTime.getTime())
        );

        return futureSuggestions.slice(0, 3);
    }
    
}