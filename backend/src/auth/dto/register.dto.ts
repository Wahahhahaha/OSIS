import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Username tidak boleh kosong' })
  username: string;

  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Level tidak boleh kosong' })
  levelname: string; // student, school, employer

  @IsString()
  @IsOptional()
  rolename?: string; // principal, viceprincipal, members, etc.

  @IsString()
  @IsOptional()
  classname?: string; // e.g. "X RPL 1"
}
