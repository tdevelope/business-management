import { Module } from "@nestjs/common";
import { BusinessSettingsController } from "./business-settings.controller";
import { BusinessSettingsService } from "./business-settings.service";
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BusinessSettingsController],
  providers: [BusinessSettingsService],
  exports: [BusinessSettingsService],
})
export class BusinessSettingsModule {}
