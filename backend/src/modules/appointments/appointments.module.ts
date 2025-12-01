import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { BusinessSettingsModule } from '../business-settings/business-settings.module';

@Module({
    imports: [PrismaModule, BusinessSettingsModule],
    providers: [AppointmentsService],
    controllers: [AppointmentsController]
})
export class AppointmentsModule {}
