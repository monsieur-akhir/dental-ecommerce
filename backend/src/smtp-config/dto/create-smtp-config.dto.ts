import { IsString, IsNumber, IsBoolean, IsOptional, IsEmail, Min, Max } from 'class-validator';

export class CreateSmtpConfigDto {
  @IsString()
  host: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  port: number;

  @IsEmail()
  username: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsEmail()
  adminEmail?: string;

  @IsOptional()
  @IsBoolean()
  secure?: boolean;

  @IsOptional()
  @IsBoolean()
  auth?: boolean;

  @IsOptional()
  @IsBoolean()
  starttls?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(30000)
  connectionTimeout?: number;

  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(30000)
  timeout?: number;

  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(30000)
  writeTimeout?: number;

  @IsOptional()
  @IsBoolean()
  debug?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
} 