import { 
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional  
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(40)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password must include uppercase, lowercase and a number',
  })
  password!: string;

  @IsOptional()
  @IsString()
  role?: string; // admin / customer
}
