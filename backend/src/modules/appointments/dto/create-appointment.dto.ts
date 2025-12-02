import {
  IsInt,
  IsDateString,
  Matches,
  IsUUID,
  IsOptional
} from 'class-validator';

export class CreateAppointmentDto {

  @IsInt()
  serviceId!: number;

  @IsDateString()
  date!: string; // YYYY-MM-DD

  @Matches(/^\d{2}:\d{2}$/, {
    message: 'startTime must be in HH:MM format',
  })
  startTime!: string; // HH:mm

  @IsOptional()
  @IsUUID()
  userId?: string;
}
