import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../prisma/prisma.service';

@Processor('reminders')
@Injectable()
export class ReminderProcessor {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService
  ) {}

  @Process('appointment-reminder')
  async handle(job: Job<{ appointmentId: number; userId: number }>) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: job.data.appointmentId },
      include: { service: true }
    });
    const user = await this.prisma.user.findUnique({ where: { id: job.data.userId } });

    if (appointment && user && appointment.status !== 'cancelled') {
      await this.notificationsService.sendAppointmentReminderEmail(user, appointment);
    }
  }
}
