import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { BullModule } from '@nestjs/bull';
import { ReminderProcessor } from './reminder.processor';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'reminders',
    }),
    PrismaModule
  ],
  providers: [NotificationsService, ReminderProcessor],
  exports: [NotificationsService, BullModule],
})
export class NotificationsModule {}
