import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  @Matches(/^[A-Za-zא-ת ]+$/, { message: 'First name must contain letters only' })
  firstName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(20)
  @Matches(/^[A-Za-zא-ת ]+$/, { message: 'Last name must contain letters only' })
  lastName!: string;

  @IsString()
  @Matches(/^(05\d{8}|0[2-9]\d{7})$/, { message: 'Phone must be a valid Israeli mobile number' })
  phone!: string;
}
