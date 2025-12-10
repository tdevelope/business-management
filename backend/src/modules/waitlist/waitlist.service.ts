import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { UpdateWaitlistDto } from './dto/update-waitlist.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class WaitlistService {
    constructor
    (
        private prisma: PrismaService,
        private notificationsService: NotificationsService,
        private userService: UsersService
    )
    { }

    create(dto: CreateWaitlistDto) {
        return this.prisma.waitlist.create({ data: dto });
    }

    findAll() {
        return this.prisma.waitlist.findMany();
    }

    findOne(id: number) {
        return this.prisma.waitlist.findUnique({ where: { id } });
    }

    findManyByUser(userId: number) {
        return this.prisma.waitlist.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
        });
    }

    update(id: number, dto: UpdateWaitlistDto) {
        return this.prisma.waitlist.update({ where: { id }, data: dto });
    }

    async updateIfOwner(id: number, userId: number, dto: UpdateWaitlistDto) {
        const entry = await this.prisma.waitlist.findUnique({ where: { id } });
        if (!entry || entry.userId !== userId) {
            throw new Error('Not authorized to update this waitlist entry');
        }
        return this.update(id, dto);
    }

    remove(id: number) {
        return this.prisma.waitlist.delete({ where: { id } });
    }

    async cleanupExpired(cutoffDate: Date) {
        return this.prisma.waitlist.deleteMany({
            where: {
                updatedAt: { lt: cutoffDate },
            },
        });
    }

    async notifyAvailableAppointments(serviceId: number, availableTime: Date) {
        const waitlistEntries = await this.prisma.waitlist.findMany({
            where: {
                serviceId,
                status: 'pending',
            },
        });

        if (!waitlistEntries.length) return [];

        const service = await this.prisma.service.findUnique({
            where: { id: serviceId }
        });

        const toNotify = waitlistEntries.filter(entry => {
            const preferred = entry.preferredTime || entry.preferredDate || availableTime;
            return Math.abs(new Date(preferred).getTime() - availableTime.getTime()) <= 90 * 60000;
        });

        for (const entry of toNotify) {
            const user = await this.userService.getMe(entry.userId);

            await this.notificationsService.sendWaitlistNotificationEmail(
                user,
                service,
                String(availableTime)
            );
            await this.update(entry.id, { status: 'notified' });
        }

        return toNotify;
    }
}
