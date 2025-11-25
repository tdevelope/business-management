import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsEmail,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  @Matches(/^[A-Za-zא-ת ]+$/, { message: 'First name must contain letters only' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  @Matches(/^[A-Za-zא-ת ]+$/, { message: 'Last name must contain letters only' })
  lastName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(05\d{8}|0[2-9]\d{7})$/, {
    message: 'Phone must be a valid Israeli phone number',
  })
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/,
    { message: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number' }
  )
  password!: string;

  @IsOptional()
  @IsString()
  role?: string;
}
