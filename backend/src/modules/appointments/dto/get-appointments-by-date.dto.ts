import { IsDateString } from 'class-validator';

export class GetAppointmentsByDateDto {
  @IsDateString()
  date!: string;
}
