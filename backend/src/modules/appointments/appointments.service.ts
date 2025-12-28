import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { GetAppointmentsByDateDto } from "./dto/get-appointments-by-date.dto";
import { CheckAvailabilityDto } from "./dto/check-availability.dto";
import { GetSuggestionsDto } from "./dto/get-suggestions.dto";
import { BusinessSettingsService } from "../business-settings/business-settings.service";
import { UpdateAppointmentDto } from "./dto/update-appointment.dto";
import { WaitlistService } from "../waitlist/waitlist.service";
import { NotificationsService } from "../notifications/notifications.service";
import { UsersService } from "../users/users.service";
import { Queue } from "bull";
import { InjectQueue } from "@nestjs/bull";

@Injectable()
export class AppointmentsService {

  constructor(
    private prisma: PrismaService,
    private businessSettings: BusinessSettingsService,
    private waitlistService: WaitlistService,
    private notificationsService: NotificationsService,
    private userService: UsersService,
    @InjectQueue('reminders') private readonly remindersQueue: Queue
  ) { }


  async createAppointment(dto: CreateAppointmentDto, userId: number, userRole: string) {
    const { serviceId, date, startTime } = dto;

    let appointmentUserId = userId;
    if (dto.userId) {
      appointmentUserId = Number(dto.userId);
    }
    else if (userRole === 'admin') {
      throw new BadRequestException("Admin must select a customer for the appointment");
    }

    const settings = await this.getBusinessSettings();

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

    // --- Blocked times check ---
    const blocked = await this.getBlockedTimesForDate(date);

    const blockedOverlap = blocked.some(b => {
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);
      return start < bEnd && end > bStart;
    });

    if (blockedOverlap) {
      throw new BadRequestException("This time is blocked");
    }


    const now = new Date();
    if (start < now) {
      throw new BadRequestException("Cannot book an appointment in the past");
    }

    const diffDays = (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > settings.maxAdvanceBookingDays) {
      throw new BadRequestException(
        `Cannot book more than ${settings.maxAdvanceBookingDays} days in advance`
      );
    }

    const { openDate, closeDate } = this.getBusinessWindowForDate(y, m, d, settings);

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

    const appointment = await this.prisma.appointment.create({
      data: {
        userId: appointmentUserId,
        serviceId,
        date: pureDate,
        startTime: start,
        endTime: end,
        status: "scheduled",
      },
    });

    const user = await this.userService.getMe(appointmentUserId);

    await this.notificationsService.sendAppointmentConfirmationEmail(user, appointment);

    const REMINDER_BEFORE_MS = 120 * 60 * 1000;
    const reminderTime = new Date(appointment.startTime.getTime() - REMINDER_BEFORE_MS);

    const job = await this.remindersQueue.add(
      'appointment-reminder',
      { appointmentId: appointment.id, userId: appointment.userId },
      { delay: reminderTime.getTime() - Date.now(), attempts: 3 }
    );

    await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: { reminderJobId: job.id.toString() },
    });

    return appointment;
  }

  async getAllAppointments() {
    return this.prisma.appointment.findMany({
      include: {
        service: true,
        user: true,
      },
      orderBy: {
        startTime: "asc",
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

  async updateAppointment(id: number, dto: UpdateAppointmentDto, user: any) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { service: true }
    });

    if (!appointment) {
      throw new NotFoundException("Appointment not found");
    }

    if (user.role === "customer" && appointment.userId !== user.id) {
      throw new ForbiddenException("You cannot edit this appointment");
    }

    const originalStart = new Date(appointment.startTime);
    const originalStatus = appointment.status;
    const originalJobId = appointment.reminderJobId;

    if (user.role === "admin") {
      if (!dto.startTime || !dto.endTime) {
        throw new BadRequestException("Admin must send startTime and endTime");
      }

      const start = dto.startTime instanceof Date ? dto.startTime : new Date(dto.startTime);
      const end = dto.endTime instanceof Date ? dto.endTime : new Date(dto.endTime);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestException("Invalid startTime or endTime");
      }

      const dateStr = start.toISOString().split("T")[0];
      const blocked = await this.getBlockedTimesForDate(dateStr);

      if (blocked.some(b => start < new Date(b.endTime) && end > new Date(b.startTime))) {
        throw new BadRequestException("This time is blocked");
      }

      const now = new Date();
      if (start < now) {
        throw new BadRequestException("Cannot move appointment to the past");
      }

      const settings = await this.getBusinessSettings();
      const { y, m, d } = this.parseDateParts(dateStr);
      const { openDate, closeDate } = this.getBusinessWindowForDate(y, m, d, settings);

      if (start < openDate || end > closeDate) {
        throw new BadRequestException("Appointment outside business hours");
      }

      const sameDayAppointments = await this.getForDate({ date: dateStr });
      if (sameDayAppointments.some(a => a.id !== appointment.id && start < new Date(a.endTime) && end > new Date(a.startTime))) {
        throw new BadRequestException("This time overlaps another appointment");
      }

      const wasCancelled = originalStatus === "cancelled";
      const isNowCancelled = dto.status === "cancelled";
      const timeWillChange = originalStart.getTime() !== start.getTime();

      const updated = await this.prisma.appointment.update({
        where: { id },
        data: {
          startTime: start,
          endTime: end,
          date: new Date(dateStr),
          status: dto.status || appointment.status
        },
        include: {
          service: true,
        },
      });

      const appointmentUser = await this.userService.getMe(updated.userId);

      if (!wasCancelled && isNowCancelled) {
        await this.notificationsService.sendAppointmentCancelledEmail(appointmentUser, updated);
        if (originalJobId) {
          const job = await this.remindersQueue.getJob(originalJobId);
          if (job) await job.remove();
        }
      } else if (timeWillChange && updated.status !== "cancelled") {
        await this.notificationsService.sendAppointmentUpdatedEmail(appointmentUser, updated);
        if (originalJobId) {
          const job = await this.remindersQueue.getJob(originalJobId);
          if (job) await job.remove();
        }

        const REMINDER_BEFORE_MS = 60 * 60 * 1000;
        const reminderTime = new Date(updated.startTime.getTime() - REMINDER_BEFORE_MS);
        const newJob = await this.remindersQueue.add(
          'appointment-reminder',
          { appointmentId: updated.id, userId: updated.userId },
          { delay: reminderTime.getTime() - Date.now(), attempts: 3 }
        );

        await this.prisma.appointment.update({
          where: { id: updated.id },
          data: { reminderJobId: newJob.id.toString() },
        });
      }

      if (isNowCancelled || timeWillChange) {
        await this.waitlistService.notifyAvailableAppointments(
          appointment.serviceId,
          originalStart
        );
      }

      return updated;
    }

    if (dto.status === "cancelled" && (!dto.date && !dto.startTime && !dto.preferredTime)) {
      if (originalStatus === "cancelled") return appointment;

      const updated = await this.prisma.appointment.update({
        where: { id },
        data: { status: "cancelled" },
      });

      const appointmentUser = await this.userService.getMe(updated.userId);
      await this.notificationsService.sendAppointmentCancelledEmail(appointmentUser, updated);

      if (originalJobId) {
        const job = await this.remindersQueue.getJob(originalJobId);
        if (job) await job.remove();
      }

      await this.waitlistService.notifyAvailableAppointments(
        appointment.serviceId,
        originalStart
      );

      return updated;
    }

    if (!dto.date || !dto.preferredTime) {
      throw new BadRequestException("date and preferredTime are required for customers");
    }

    const suggestions = await this.getSuggestions({
      serviceId: appointment.serviceId,
      date: dto.date,
      preferredTime: dto.preferredTime
    });

    if (!suggestions.length) throw new BadRequestException("No available suggestions");
    if (!dto.startTime) throw new BadRequestException("You must send the chosen startTime from suggestions");

    const chosenTimeStr = dto.startTime instanceof Date ? dto.startTime.toISOString() : dto.startTime;
    if (!chosenTimeStr) throw new BadRequestException("Invalid chosen startTime");

    const chosen = suggestions.find(s => s.start === chosenTimeStr);
    if (!chosen) throw new BadRequestException("Invalid suggestion selected");

    const oldStart = new Date(appointment.startTime);

    const chosenStartDate = new Date(chosen.start);
    const chosenEndDate = new Date(chosen.end);

    const updated = await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        startTime: chosenStartDate,
        endTime: chosenEndDate,
        date: new Date(dto.date),
        status: dto.status || appointment.status
      },
      include: {
        service: true,
      },
    });

    const timeChanged = oldStart.getTime() !== updated.startTime.getTime();
    const wasCancelledCustomer = originalStatus === "cancelled";
    const isNowCancelledCustomer = updated.status === "cancelled";

    const appointmentUser = await this.userService.getMe(updated.userId);

    if (!wasCancelledCustomer && isNowCancelledCustomer) {
      await this.notificationsService.sendAppointmentCancelledEmail(appointmentUser, updated);
      if (originalJobId) {
        const job = await this.remindersQueue.getJob(originalJobId);
        if (job) await job.remove();
      }
    } else if (timeChanged && updated.status !== "cancelled") {
      await this.notificationsService.sendAppointmentUpdatedEmail(appointmentUser, updated);
      if (originalJobId) {
        const job = await this.remindersQueue.getJob(originalJobId);
        if (job) await job.remove();
      }

      const REMINDER_BEFORE_MS = 60 * 60 * 1000;
      const reminderTime = new Date(updated.startTime.getTime() - REMINDER_BEFORE_MS);
      const newJob = await this.remindersQueue.add(
        'appointment-reminder',
        { appointmentId: updated.id, userId: updated.userId },
        { delay: reminderTime.getTime() - Date.now(), attempts: 3 }
      );

      await this.prisma.appointment.update({
        where: { id: updated.id },
        data: { reminderJobId: newJob.id.toString() },
      });
    }

    if (isNowCancelledCustomer || timeChanged) {
      await this.waitlistService.notifyAvailableAppointments(
        appointment.serviceId,
        oldStart
      );
    }

    return updated;
  }

  async delete(id: number) {
    const appointmentToDelete = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointmentToDelete) {
      throw new NotFoundException("Appointment not found");
    }

    if (appointmentToDelete.reminderJobId) {
      const job = await this.remindersQueue.getJob(appointmentToDelete.reminderJobId);
      if (job) {
        await job.remove();
      }
    }

    const deleted = await this.prisma.appointment.delete({ where: { id } });

    await this.waitlistService.notifyAvailableAppointments(
      appointmentToDelete.serviceId,
      appointmentToDelete.startTime
    );

    return deleted;
  }

  async checkAvailability(dto: CheckAvailabilityDto): Promise<boolean> {
    const { serviceId, date, startTime } = dto;

    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return false;
    }

    const settings = await this.getBusinessSettings();

    const { y, m, d } = this.parseDateParts(date);
    const { hh, mm } = this.validateTimeString(startTime);

    const start = new Date(y, m - 1, d, hh, mm);
    const end = new Date(start.getTime() + service.duration * 60000);

    // --- Blocked times check ---
    const blocked = await this.getBlockedTimesForDate(date);

    const blockedOverlap = blocked.some(b => {
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);
      return start < bEnd && end > bStart;
    });

    if (blockedOverlap) {
      return false
    }

    const { openDate, closeDate } = this.getBusinessWindowForDate(y, m, d, settings);

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
    // Create date objects treating the input as local time
    const preferredDateTime = new Date(y, m - 1, d, hh, mm);
    const preferredDateOnly = new Date(y, m - 1, d, 0, 0, 0);

    const now = new Date();
    
    // Check if the preferred time is in the past
    if (preferredDateTime < now) {
      throw new BadRequestException(
        "Cannot generate suggestions for a past time"
      );
    }

    const diffDays =
      (preferredDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    const settings = await this.getBusinessSettings();

    if (diffDays > settings.maxAdvanceBookingDays) {
      throw new BadRequestException(
        `Cannot generate suggestions more than ${settings.maxAdvanceBookingDays} days in advance`
      );
    }

    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service) {
      throw new NotFoundException("Service not found");
    }

    const duration = service.duration;

    const { openDate, closeDate } = this.getBusinessWindowForDate(y, m, d, settings);

    const appointments = await this.getForDate({ date });
    const busySlots = appointments
      .filter((a) => a.startTime && a.endTime)
      .map((a) => ({
        start: new Date(a.startTime),
        end: new Date(a.endTime),
      }))
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    // --- Add blocked times to busySlots ---
    const blocked = await this.getBlockedTimesForDate(date);

    for (const b of blocked) {
      busySlots.push({
        start: new Date(b.startTime),
        end: new Date(b.endTime)
      });
    }

    // re-sort including blocked slots
    busySlots.sort((a, b) => a.start.getTime() - b.start.getTime());

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

    // Filter out suggestions that are in the past and ensure we're checking against current time correctly
    const futureSuggestions = possibleSuggestions.filter(
      (s) => s.start.getTime() > now.getTime() && s.start >= openDate && s.end <= closeDate
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

    // Return suggestions as ISO-like strings without UTC conversion
    // We format as YYYY-MM-DDTHH:mm:ss to preserve local time
    return inRangeSuggestions.slice(0, 3).map(s => {
      const year = s.start.getFullYear();
      const month = String(s.start.getMonth() + 1).padStart(2, '0');
      const day = String(s.start.getDate()).padStart(2, '0');
      const hours = String(s.start.getHours()).padStart(2, '0');
      const minutes = String(s.start.getMinutes()).padStart(2, '0');
      const seconds = String(s.start.getSeconds()).padStart(2, '0');
      
      const startStr = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      
      const endYear = s.end.getFullYear();
      const endMonth = String(s.end.getMonth() + 1).padStart(2, '0');
      const endDay = String(s.end.getDate()).padStart(2, '0');
      const endHours = String(s.end.getHours()).padStart(2, '0');
      const endMinutes = String(s.end.getMinutes()).padStart(2, '0');
      const endSeconds = String(s.end.getSeconds()).padStart(2, '0');
      
      const endStr = `${endYear}-${endMonth}-${endDay}T${endHours}:${endMinutes}:${endSeconds}`;
      
      return { start: startStr, end: endStr };
    });
  }

  private async getBusinessSettings() {
    return await this.businessSettings.getSettings();
  }

  private async getBlockedTimesForDate(date: string) {
    const { y, m, d } = this.parseDateParts(date);

    const dayStart = new Date(y, m - 1, d, 0, 0, 0);
    const dayEnd = new Date(y, m - 1, d, 23, 59, 59, 999);

    return this.prisma.blockedTime.findMany({
      where: {
        startTime: { gte: dayStart, lte: dayEnd }
      }
    });
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
    d: number,
    settings: any
  ): { openDate: Date; closeDate: Date } {

    const workingDays = settings.workingDays as number[];
    const { openTime, closeTime } = settings.openingHours as {
      openTime: string;
      closeTime: string;
    };

    const dayOfWeek = new Date(y, m - 1, d).getDay();
    if (!workingDays.includes(dayOfWeek)) {
      throw new BadRequestException("The business is closed on this day");
    }

    const [openH, openM] = openTime.split(":").map(Number);
    const [closeH, closeM] = closeTime.split(":").map(Number);

    const openDate = new Date(y, m - 1, d, openH, openM);
    const closeDate = new Date(y, m - 1, d, closeH, closeM);

    return { openDate, closeDate };
  }
}
