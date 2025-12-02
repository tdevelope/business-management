import { Module } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { WaitlistController } from './waitlist.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { WaitlistCleanupService } from './waitlist-cleanup.service';

@Module({
  controllers: [WaitlistController],
  providers: [WaitlistService, WaitlistCleanupService,PrismaService],
})
export class WaitlistModule {}
