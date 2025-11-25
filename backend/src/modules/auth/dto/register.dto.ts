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
  @Matches(/^[A-Za-zא-ת]+$/, { message: 'First name must contain letters only' })
  firstName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(30)
  @Matches(/^[A-Za-zא-ת]+$/, { message: 'Last name must contain letters only' })
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Matches(/^(05\d{8}|0[2-9]\d{7})$/, { message: 'Invalid phone number' })
  phone!: string;

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
