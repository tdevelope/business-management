import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { WaitlistService } from './waitlist.service';

@Injectable()
export class WaitlistCleanupService {
  constructor(private waitlistService: WaitlistService) {}

  @Cron('0 0 1 */3 *') 
  async handleCleanup() {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    await this.waitlistService.cleanupExpired(threeMonthsAgo);
  }
}
