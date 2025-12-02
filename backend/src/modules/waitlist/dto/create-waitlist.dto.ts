import { IsInt, IsOptional, IsDateString } from 'class-validator';

export class CreateWaitlistDto {
  @IsInt()
  userId!: number;

  @IsInt()
  serviceId!: number;

  @IsOptional()
  @IsDateString()
  preferredDate?: string;

  @IsOptional()
  @IsDateString()
  preferredTime?: string;
}
