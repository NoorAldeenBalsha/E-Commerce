import {IsEmail,IsNotEmpty,IsString,} from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  password: string;
}