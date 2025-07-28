import { IsString, IsArray, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyPromoCodeDto {
  @ApiProperty({
    description: 'Code promo à appliquer',
    example: 'NOEL2024'
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Montant total du panier',
    example: 150.50
  })
  @IsNumber()
  cartTotal: number;

  @ApiProperty({
    description: 'Articles du panier avec leurs détails',
    example: [
      {
        productId: 1,
        quantity: 2,
        price: 45.99,
        categoryIds: [1, 2]
      }
    ]
  })
  @IsArray()
  cartItems: Array<{
    productId: number;
    quantity: number;
    price: number;
    categoryIds?: number[];
  }>;

  @ApiProperty({
    description: 'Métadonnées additionnelles du panier',
    example: { shippingMethod: 'standard', region: 'EU' },
    required: false
  })
  @IsOptional()
  cartMetadata?: any;
}

