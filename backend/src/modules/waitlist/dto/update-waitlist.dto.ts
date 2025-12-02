import { IsOptional, IsString } from 'class-validator';

export class UpdateWaitlistDto {
  @IsOptional()
  @IsString()
  status?: 'pending' | 'notified' | 'fulfilled' | 'expired';
}
