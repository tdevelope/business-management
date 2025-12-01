import { Body, Controller, ForbiddenException, Get, Put, Req } from "@nestjs/common";
import { BusinessSettingsService } from "./business-settings.service";
import { UpdateBusinessSettingsDto } from "./dto/update-business-settings.dto";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";


@UseGuards(JwtAuthGuard)
@Controller("business-settings")
export class BusinessSettingsController {
  constructor(private readonly service: BusinessSettingsService) {}

  @Get()
  getSettings(@Req() req) {
    if (req.user.role !== "admin") 
      throw new ForbiddenException("Admins only");
    return this.service.getSettings();
  }

  @Put()
  updateSettings(@Body() dto: UpdateBusinessSettingsDto, @Req() req) {
    if (req.user.role !== "admin") 
      throw new ForbiddenException("Admins only");
    return this.service.updateSettings(dto);
  }
}
