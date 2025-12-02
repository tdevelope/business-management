import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { BusinessSettingsModule } from '../business-settings/business-settings.module';
import { WaitlistModule } from '../waitlist/waitlist.module';
import { WaitlistService } from '../waitlist/waitlist.service';

@Module({
    imports: [PrismaModule, BusinessSettingsModule, WaitlistModule],
    providers: [AppointmentsService, WaitlistService],
    controllers: [AppointmentsController]
})
export class AppointmentsModule {}
