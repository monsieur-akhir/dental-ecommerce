import {
  IsString,
  IsEnum,
  IsNumber,
  IsDate,
  IsOptional,
  IsBoolean,
  IsArray,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PromotionType, PromotionStatus } from '../../entities/promotion.entity';

export class CreatePromotionDto {
  @ApiProperty({
    description: 'Nom de la promotion',
    example: 'Promotion de Noël 2024'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description de la promotion',
    example: 'Réduction de 20% sur tous les produits dentaires',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Type de promotion',
    enum: PromotionType,
    example: PromotionType.PERCENTAGE
  })
  @IsEnum(PromotionType)
  type: PromotionType;

  @ApiProperty({
    description: 'Statut de la promotion',
    enum: PromotionStatus,
    example: PromotionStatus.DRAFT,
    required: false,
    default: PromotionStatus.DRAFT
  })
  @IsOptional()
  @IsEnum(PromotionStatus)
  status?: PromotionStatus;

  @ApiProperty({
    description: 'Valeur de la réduction (pourcentage ou montant fixe)',
    example: 20,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountValue?: number;

  @ApiProperty({
    description: 'Montant minimum de commande requis',
    example: 100,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderAmount?: number;

  @ApiProperty({
    description: 'Montant maximum de réduction (pour limiter les pourcentages)',
    example: 50,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumDiscountAmount?: number;

  @ApiProperty({
    description: 'Quantité à acheter (pour buy_x_get_y)',
    example: 2,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  buyQuantity?: number;

  @ApiProperty({
    description: 'Quantité gratuite (pour buy_x_get_y)',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  getQuantity?: number;

  @ApiProperty({
    description: 'Date de début de la promotion',
    example: '2024-12-01T00:00:00Z'
  })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    description: 'Date de fin de la promotion',
    example: '2024-12-31T23:59:59Z'
  })
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({
    description: 'Limite d\'utilisation globale (0 = illimité)',
    example: 1000,
    required: false,
    default: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  usageLimit?: number;

  @ApiProperty({
    description: 'Limite d\'utilisation par utilisateur',
    example: 1,
    required: false,
    default: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimitPerUser?: number;

  @ApiProperty({
    description: 'Peut être combinée avec d\'autres promotions',
    example: false,
    required: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isStackable?: boolean;

  @ApiProperty({
    description: 'S\'applique aux produits déjà en promotion',
    example: false,
    required: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  applyToSale?: boolean;

  @ApiProperty({
    description: 'IDs des produits concernés (optionnel)',
    example: [1, 2, 3],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  productIds?: number[];

  @ApiProperty({
    description: 'IDs des catégories concernées (optionnel)',
    example: [1, 2],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  categoryIds?: number[];

  @ApiProperty({
    description: 'Conditions supplémentaires',
    example: { minItems: 3, excludeBrands: ['Brand X'] },
    required: false
  })
  @IsOptional()
  @IsObject()
  conditions?: any;

  @ApiProperty({
    description: 'Métadonnées additionnelles',
    example: { campaign: 'holiday2024', source: 'email' },
    required: false
  })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

