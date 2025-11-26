import { IsDateString, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetSuggestionsDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  serviceId!: number;

  @IsDateString()
  @IsNotEmpty()
  date!: string; // YYYY-MM-DD
  @IsString()
  @IsNotEmpty()
  preferredTime!: string; // HH:MM (24h)
}
