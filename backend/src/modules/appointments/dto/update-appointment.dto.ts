import { IsOptional, IsString } from "class-validator";

export class UpdateAppointmentDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  preferredTime?: string;

  @IsOptional()
  startTime?: string | Date;

  @IsOptional()
  endTime?: string | Date;

  @IsOptional()
  @IsString()
  status?: string;
}
