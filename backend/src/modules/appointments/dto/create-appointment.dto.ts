import { IsInt, IsString, IsDateString } from 'class-validator';

export class CreateAppointmentDto {
  @IsInt()
  customerId!: number;

  @IsInt()
  serviceId!: number;

  @IsDateString()
  date!: string; // YYYY-MM-DD

  @IsString()
  startTime!: string; // HH:mm
}
