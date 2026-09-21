import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsEmail, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserGender, UserRole } from 'utilitis/enums';

export class UpdateUserDto{
  @ApiProperty({ description: 'Name of the user', example: 'Noor Aldeen Balsha' })
  @IsString()
  @IsOptional()
  @MinLength(3)
  firstName: string;
  //============================================================================
  @ApiProperty({ description: 'Name of the user', example: 'Noor Aldeen Balsha' })
  @IsString()
  @IsOptional()
  @MinLength(3)
  lastName: string;
  //============================================================================
  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @IsEmail()
  @IsOptional()
  email: string;
  //============================================================================
  @ApiProperty({ description: 'User role', enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
  //============================================================================
  @ApiProperty({ description: 'Phone', required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;
  //============================================================================
  @ApiProperty({ description: 'picture', required: false })
  @IsString()
  @IsOptional()
  avatarUrl: string;
    
}