import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { BusinessSettingsModule } from '../business-settings/business-settings.module';
import { WaitlistModule } from '../waitlist/waitlist.module';
import { WaitlistService } from '../waitlist/waitlist.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [PrismaModule, BusinessSettingsModule, WaitlistModule, NotificationsModule, UsersModule],
    providers: [AppointmentsService, WaitlistService],
    controllers: [AppointmentsController]
})
export class AppointmentsModule {}
