import {IsEmail,IsNotEmpty,IsOptional,IsString,Matches,MaxLength,MinLength,} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;
  //============================================================================
  @IsString()
  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  @MinLength(8, { message: 'يجب ألا تقل كلمة المرور عن 8 محارف' })
  @MaxLength(32, { message: 'يجب ألا تزيد كلمة المرور عن 32 محرفاً' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: 'كلمة المرور ضعيفة: يجب أن تحوي حرفاً كبيراً، حرفاً صغيراً، ورقماً أو رمزاً خاصاً',})
  password: string;
  //============================================================================
  @IsString()
  @IsNotEmpty({ message: 'الاسم الأول مطلوب' })
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  firstName: string;
  //============================================================================
  @IsString()
  @IsNotEmpty({ message: 'الاسم الأخير مطلوب' })
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  lastName: string;
  //============================================================================
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  fullName: string;
  //============================================================================
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{7,14}$/, {message: 'رقم الهاتف يجب أن يكون بالصيغة الدولية القياسية (E.164)، مثال: +963912345678',})
  phoneNumber?: string;
  //============================================================================
}