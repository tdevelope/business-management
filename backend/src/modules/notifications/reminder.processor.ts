import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../prisma/prisma.service';

@Processor('reminders')
@Injectable()
export class ReminderProcessor {
  private logger = new Logger(ReminderProcessor.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService
  ) {}

  @Process('appointment-reminder')
  async handle(job: Job<{ appointmentId: number; userId: number }>) {
    try {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: job.data.appointmentId },
        include: { service: true }
      });
      const user = await this.prisma.user.findUnique({ where: { id: job.data.userId } });

      if (!appointment) {
        this.logger.warn(`Appointment ${job.data.appointmentId} not found`);
        return;
      }

      if (!user) {
        this.logger.warn(`User ${job.data.userId} not found`);
        return;
      }

      if (appointment.status === 'cancelled') {
        this.logger.log(`Skipping reminder for cancelled appointment ${appointment.id}`);
        return;
      }

      await this.notificationsService.sendAppointmentReminderEmail(user, appointment);
      this.logger.log(`Reminder sent for appointment ${appointment.id} to user ${user.id}`);
    } catch (error) {
      this.logger.error(`Error processing reminder job: ${error instanceof Error ? error.message : error}`);
      throw error;  // Throw to trigger retry logic
    }
  }
}
