import { 
  IsInt,
  IsDateString,
  Matches
} from 'class-validator';

export class CreateAppointmentDto {
  @IsInt()
  userId!: number;

  @IsInt()
  serviceId!: number;

  @IsDateString()
  date!: string; // YYYY-MM-DD

  @Matches(/^\d{2}:\d{2}$/, {
    message: 'startTime must be in HH:MM format',
  })
  startTime!: string; // HH:mm
}
