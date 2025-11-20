import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AppointmentsService {
    constructor(private prisma: PrismaService) {}

    async createAppointment(dto: { customerId: number; date: string; time: string; notes?: string }) {
        return this.prisma.appointment.create({ data: dto });
    }

    async getForDate(date: string) {
        return this.prisma.appointment.findMany({
            where: { date },
            include: { customer: true },
        });
    }

    async checkAvailability(date: string, time: string) {
        const appointment = await this.prisma.appointment.findFirst({
            where: { date, time },
        });
        return appointment === null;
    }
}