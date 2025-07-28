import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Adresse email de l\'utilisateur',
    example: 'john.doe@example.com',
    format: 'email'
  })
  @IsEmail({}, { message: 'L\'email doit être valide' })
  email: string;

  @ApiProperty({
    description: 'Mot de passe (minimum 6 caractères)',
    example: 'motdepasse123',
    minLength: 6
  })
  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  password: string;

  @ApiProperty({
    description: 'Prénom de l\'utilisateur',
    example: 'John',
    required: false
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    description: 'Nom de famille de l\'utilisateur',
    example: 'Doe',
    required: false
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'Numéro de téléphone',
    example: '+33123456789',
    required: false
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Adresse postale',
    example: '123 Rue de la Paix',
    required: false
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Ville',
    example: 'Paris',
    required: false
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'Code postal',
    example: '75001',
    required: false
  })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({
    description: 'Pays',
    example: 'France',
    required: false
  })
  @IsOptional()
  @IsString()
  country?: string;
}