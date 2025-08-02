import { IsEnum, IsString, IsOptional, IsBoolean, IsObject, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Type de notification',
    enum: NotificationType,
    example: NotificationType.ORDER_CONFIRMED
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    description: 'Titre de la notification',
    example: 'Commande confirmée'
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Message de la notification',
    example: 'Votre commande #12345 a été confirmée et sera traitée sous peu.'
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'URL d\'action (optionnel)',
    example: '/orders/12345',
    required: false
  })
  @IsOptional()
  @IsUrl()
  actionUrl?: string;

  @ApiProperty({
    description: 'Métadonnées additionnelles (optionnel)',
    example: { orderId: 12345, amount: 150.50 },
    required: false
  })
  @IsOptional()
  @IsObject()
  metadata?: any;

  @ApiProperty({
    description: 'Envoyer en tant que notification push',
    example: true,
    required: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isPush?: boolean;
}

