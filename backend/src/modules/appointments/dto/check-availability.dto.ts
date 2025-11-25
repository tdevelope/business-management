import { IsInt, IsDateString, IsString } from 'class-validator';

export class CheckAvailabilityDto {
  @IsInt()
  serviceId!: number;

  @IsDateString()
  date!: string;

  @IsString()
  startTime!: string;
}
