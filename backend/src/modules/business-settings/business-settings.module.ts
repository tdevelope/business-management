import { Module } from "@nestjs/common";
import { BusinessSettingsController } from "./business-settings.controller";
import { BusinessSettingsService } from "./business-settings.service";
import { PrismaModule } from '../../prisma/prisma.module';
import { BlockedTimesService } from "./blocked-times.service";
import { BlockedTimesController } from "./blocked-times.controller";

@Module({
  imports: [PrismaModule],
  controllers: [BusinessSettingsController, BlockedTimesController],
  providers: [BusinessSettingsService, BlockedTimesService],
  exports: [BusinessSettingsService],
})
export class BusinessSettingsModule {}
