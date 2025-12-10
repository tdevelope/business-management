// backend/src/business-settings/blocked-times.service.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBlockedTimeDto } from "./dto/create-blocked-time.dto";
import { UpdateBlockedTimeDto } from "./dto/update-blocked-time.dto";

@Injectable()
export class BlockedTimesService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  findAll() {
    return this.prisma.blockedTime.findMany({
      orderBy: { startTime: "asc" },
    });
  }

  async create(dto: CreateBlockedTimeDto) {
    const bStart = new Date(dto.startTime);
    const bEnd = new Date(dto.endTime);

    const overlappingAppointments = await this.prisma.appointment.findMany({
      where: {
        startTime: { lt: bEnd },
        endTime: { gt: bStart },
        status: "scheduled",
      },
    });

    for (const appt of overlappingAppointments) {
      await this.prisma.appointment.update({
        where: { id: appt.id },
        data: {
          status: "cancelled",
        },
      });
    }

    return this.prisma.blockedTime.create({
      data: {
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        reason: dto.reason ?? null,
      },
    });
  }

  update(id: number, dto: UpdateBlockedTimeDto) {
    return this.prisma.blockedTime.update({
      where: { id },
      data: {
        ...(dto.startTime && { startTime: new Date(dto.startTime) }),
        ...(dto.endTime && { endTime: new Date(dto.endTime) }),
        ...(dto.reason !== undefined && { reason: dto.reason }),
      },
    });
  }

  delete(id: number) {
    return this.prisma.blockedTime.delete({
      where: { id },
    });
  }
}
