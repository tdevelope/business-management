import { 
  IsString, MinLength, MaxLength, Matches, 
  IsInt, Min, Max, 
  IsOptional
} from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  @Matches(/^[A-Za-zא-ת ]+$/, { message: 'Service name must contain letters only' })
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(2)       
  @Max(1440)
  duration!: number;

  @IsInt()
  @Min(1)
  @Max(10000)
  price!: number;
}
