import { 
  IsInt, 
  IsDateString, 
  Matches 
} from 'class-validator';

export class CheckAvailabilityDto {
  @IsInt()
  serviceId!: number;

  @IsDateString()
  date!: string;

  @Matches(/^\d{2}:\d{2}$/, {
    message: 'startTime must be in HH:MM format',
  })
  startTime!: string;
}
