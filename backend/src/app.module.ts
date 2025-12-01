import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ServicesModule } from './modules/services/services.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { BusinessSettingsModule } from './modules/business-settings/business-settings.module';

@Module({
  imports: [AuthModule, UsersModule, ServicesModule, AppointmentsModule, BusinessSettingsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
