import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { GetAppointmentsByDateDto } from "./dto/get-appointments-by-date.dto";
import { CheckAvailabilityDto } from "./dto/check-availability.dto";
import { GetSuggestionsDto } from "./dto/get-suggestions.dto";

@Injectable()
export class AppointmentsService {
  private readonly WORKING_DAYS = [0, 1, 2, 3, 4];
  private readonly OPEN_TIME = "09:00";
  private readonly CLOSE_TIME = "17:00";
  private readonly MAX_DAYS = 90;

  constructor(private prisma: PrismaService) { }

  async createAppointment(dto: CreateAppointmentDto, userId: number) {
    const { serviceId, date, startTime } = dto;

    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException("Service not found");
    }

    const { y, m, d } = this.parseDateParts(date);
    const { hh, mm } = this.validateTimeString(startTime);

    const start = new Date(y, m - 1, d, hh, mm);
    const end = new Date(start.getTime() + service.duration * 60000);

    const now = new Date();
    if (start < now) {
      throw new BadRequestException("Cannot book an appointment in the past");
    }

    const diffDays = (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > this.MAX_DAYS) {
      throw new BadRequestException(
        `Cannot book more than ${this.MAX_DAYS} days in advance`
      );
    }

    const { openDate, closeDate } = this.getBusinessWindowForDate(y, m, d);

    if (start < openDate || end > closeDate) {
      throw new BadRequestException("Appointment is outside business hours");
    }

    const isAvailable = await this.checkAvailability({
      serviceId,
      date,
      startTime,
    });

    if (!isAvailable) {
      throw new BadRequestException("This time slot is not available");
    }

    const pureDate = new Date(y, m - 1, d);

    return this.prisma.appointment.create({
      data: {
        userId,
        serviceId,
        date: pureDate,
        startTime: start,
        endTime: end,
        status: "scheduled",
      },
    });
  }

  async getForDate(dto: GetAppointmentsByDateDto) {
    const { date } = dto;

    const { y, m, d } = this.parseDateParts(date);
    const dayStart = new Date(y, m - 1, d, 0, 0, 0);
    const dayEnd = new Date(y, m - 1, d, 23, 59, 59, 999);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        startTime: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      orderBy: {
        startTime: "asc",
      },
      include: {
        service: true,
        user: true,
      },
    });

    return this.updateExpiredAppointments(appointments);
  }

  async getMyAppointments(userId: number) {
    const appointments = await this.prisma.appointment.findMany({
      where: { userId },
      orderBy: { startTime: "asc" },
      include: { service: true },
    });

    return this.updateExpiredAppointments(appointments);
  }

  async delete(id: number) {
    return this.prisma.appointment.delete({
      where: { id },
    });
  }

  async checkAvailability(dto: CheckAvailabilityDto): Promise<boolean> {
    const { serviceId, date, startTime } = dto;

    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return false;
    }

    const { y, m, d } = this.parseDateParts(date);
    const { hh, mm } = this.validateTimeString(startTime);

    const start = new Date(y, m - 1, d, hh, mm);
    const end = new Date(start.getTime() + service.duration * 60000);

    const { openDate, closeDate } = this.getBusinessWindowForDate(y, m, d);

    if (start < openDate || end > closeDate) {
      throw new BadRequestException("Appointment is outside business hours");
    }

    const appointments = await this.getForDate({ date });

    const overlap = appointments.some((a) => {
      return start < a.endTime && end > a.startTime;
    });

    return !overlap;
  }

  async getSuggestions(dto: GetSuggestionsDto) {
    const { serviceId, date, preferredTime } = dto;

    const { hh, mm } = this.validateTimeString(preferredTime);

    const { y, m, d } = this.parseDateParts(date);
    const preferredDateTime = new Date(y, m - 1, d, hh, mm);

    const now = new Date();
    const diffDays =
      (preferredDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (preferredDateTime < now) {
      throw new BadRequestException(
        "Cannot generate suggestions for a past date"
      );
    }

    if (diffDays > this.MAX_DAYS) {
      throw new BadRequestException(
        `Cannot generate suggestions more than ${this.MAX_DAYS} days in advance`
      );
    }

    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service) {
      throw new NotFoundException("Service not found");
    }

    const duration = service.duration;

    const { openDate, closeDate } = this.getBusinessWindowForDate(y, m, d);

    const appointments = await this.getForDate({ date });
    const busySlots = appointments
      .filter((a) => a.startTime && a.endTime)
      .map((a) => ({
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
      freeSlots.push({ start: new Date(current), end: new Date(closeDate) });
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

    if (possibleSuggestions.length === 0) {
      return [];
    }

    const futureSuggestions = possibleSuggestions.filter(
      (s) => s.start >= now
    );

    if (futureSuggestions.length === 0) {
      return [];
    }

    const MAX_OFFSET_MINUTES = 240; // 4 hours before/after

    const inRangeSuggestions = futureSuggestions.filter((s) => {
      const diffMinutes =
        Math.abs(s.start.getTime() - preferredDateTime.getTime()) / (1000 * 60);
      return diffMinutes <= MAX_OFFSET_MINUTES;
    });

    if (inRangeSuggestions.length === 0) {
      return [];
    }

    inRangeSuggestions.sort(
      (a, b) =>
        Math.abs(a.start.getTime() - preferredDateTime.getTime()) -
        Math.abs(b.start.getTime() - preferredDateTime.getTime())
    );

    return inRangeSuggestions.slice(0, 3);
  }

  private async updateExpiredAppointments(appointments: any[]) {
    const now = new Date();

    for (const appt of appointments) {
      if (appt.endTime < now && appt.status === "scheduled") {
        await this.prisma.appointment.update({
          where: { id: appt.id },
          data: { status: "done" },
        });
        appt.status = "done";
      }
    }

    return appointments;
  }

  private parseDateParts(date: string): { y: number; m: number; d: number } {
    const [y, m, d] = date.split("-").map(Number);
    return { y, m, d };
  }

  private validateTimeString(time: string): { hh: number; mm: number } {
    if (!/^\d{2}:\d{2}$/.test(time)) {
      throw new BadRequestException("Invalid time format");
    }

    const [hh, mm] = time.split(":").map(Number);

    if (hh < 0 || hh > 23 || mm < 0 || mm > 59) {
      throw new BadRequestException("Invalid hour or minute value");
    }

    return { hh, mm };
  }

  private getBusinessWindowForDate(
    y: number,
    m: number,
    d: number
  ): { openDate: Date; closeDate: Date } {
    const dayOfWeek = new Date(y, m - 1, d).getDay();
    if (!this.WORKING_DAYS.includes(dayOfWeek)) {
      throw new BadRequestException("The business is closed on this day");
    }

    const [openH, openM] = this.OPEN_TIME.split(":").map(Number);
    const [closeH, closeM] = this.CLOSE_TIME.split(":").map(Number);

    const openDate = new Date(y, m - 1, d, openH, openM);
    const closeDate = new Date(y, m - 1, d, closeH, closeM);

    return { openDate, closeDate };
  }
}
