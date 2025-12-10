import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { BullModule } from '@nestjs/bull';
import { ReminderProcessor } from './reminder.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'reminders',
    }),
  ],
  providers: [NotificationsService, ReminderProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
