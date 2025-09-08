import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'alice@example.com' }) @IsEmail() email!: string;
  @ApiProperty({ minLength: 8 }) @IsString() @MinLength(8) password!: string;
  @ApiProperty({ minLength: 2, maxLength: 50 })
  @IsString()
  displayName!: string;
  @ApiProperty({ required: false }) @IsString() firstName?: string;
  @ApiProperty({ required: false }) @IsString() lastName?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'alice@example.com' }) @IsEmail() email!: string;
  @ApiProperty({ minLength: 8 }) @IsString() @MinLength(8) password!: string;
}
