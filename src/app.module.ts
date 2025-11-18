import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ServicesModule } from './modules/services/services.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';

@Module({
  imports: [AuthModule, CustomersModule, ServicesModule, AppointmentsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
