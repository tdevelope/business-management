import { IsArray, IsInt, Min, Max, IsObject } from "class-validator";

export class UpdateBusinessSettingsDto {
  @IsArray()
  workingDays!: number[];

  @IsObject()
  openingHours!: {
    openTime: string;
    closeTime: string;
  };

  @IsInt()
  @Min(1)
  @Max(365)
  maxAdvanceBookingDays!: number;
}
