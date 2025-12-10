import { Module } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { WaitlistController } from './waitlist.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { WaitlistCleanupService } from './waitlist-cleanup.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [NotificationsModule, UsersModule, PrismaModule],
  controllers: [WaitlistController],
  providers: [WaitlistService, WaitlistCleanupService,PrismaService],
})
export class WaitlistModule {}
