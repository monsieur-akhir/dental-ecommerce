import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Ancien mot de passe',
    example: 'ancienMotDePasse123'
  })
  @IsString({ message: 'L\'ancien mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'L\'ancien mot de passe est requis' })
  currentPassword: string;

  @ApiProperty({
    description: 'Nouveau mot de passe',
    example: 'nouveauMotDePasse123',
    minLength: 6
  })
  @IsString({ message: 'Le nouveau mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nouveau mot de passe est requis' })
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  newPassword: string;
} 