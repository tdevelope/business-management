import { Body, Controller, Get, Put } from "@nestjs/common";
import { BusinessSettingsService } from "./business-settings.service";
import { UpdateBusinessSettingsDto } from "./dto/update-business-settings.dto";

@Controller("business-settings")
export class BusinessSettingsController {
  constructor(private readonly service: BusinessSettingsService) {}

  @Get()
  getSettings() {
    return this.service.getSettings();
  }

  @Put()
  updateSettings(@Body() dto: UpdateBusinessSettingsDto) {
    return this.service.updateSettings(dto);
  }
}
