import { Injectable } from "@nestjs/common";
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateBusinessSettingsDto } from "./dto/update-business-settings.dto";

@Injectable()
export class BusinessSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.businessSettings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      settings = await this.prisma.businessSettings.create({
        data: {
          id: 1,
          workingDays: [0, 1, 2, 3, 4],
          openingHours: { openTime: "09:00", closeTime: "17:00" },
          maxAdvanceBookingDays: 90,
        },
      });
    }

    return settings;
  }

  async updateSettings(dto: UpdateBusinessSettingsDto) {
    return this.prisma.businessSettings.upsert({
      where: { id: 1 },
      update: {
        workingDays: dto.workingDays,
        openingHours: dto.openingHours,
        maxAdvanceBookingDays: dto.maxAdvanceBookingDays,
      },
      create: {
        id: 1,
        workingDays: dto.workingDays,
        openingHours: dto.openingHours,
        maxAdvanceBookingDays: dto.maxAdvanceBookingDays,
      },
    });
  }
}
