import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToComparisonDto {
  @ApiProperty({
    description: 'ID du produit à ajouter à la comparaison',
    example: 1,
    minimum: 1
  })
  @IsNumber({}, { message: 'L\'ID du produit doit être un nombre' })
  @IsPositive({ message: 'L\'ID du produit doit être positif' })
  productId: number;
}

