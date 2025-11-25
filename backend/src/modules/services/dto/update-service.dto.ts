import { 
  IsString, IsInt, IsOptional, 
  MinLength, MaxLength, Matches, Min, Max 
} from 'class-validator';

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  @Matches(/^[A-Za-zא-ת ]+$/, { message: 'Service name must contain letters only' })
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(2)         
  @Max(1440)
  duration?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  price?: number;
}
