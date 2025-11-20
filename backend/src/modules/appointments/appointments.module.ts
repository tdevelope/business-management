import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';

@Module({
    imports: [PrismaModule],
    providers: [AppointmentsService],
    controllers: [AppointmentsController]
})
export class AppointmentsModule {}
