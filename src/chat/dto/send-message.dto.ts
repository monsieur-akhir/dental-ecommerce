import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '../../entities/chat-message.entity';

export class SendMessageDto {
  @ApiProperty({
    description: 'Contenu du message',
    example: 'Merci pour votre réponse rapide !'
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Type de message',
    enum: MessageType,
    example: MessageType.TEXT,
    required: false,
    default: MessageType.TEXT
  })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @ApiProperty({
    description: 'URL du fichier (pour les messages de type file ou image)',
    example: '/uploads/chat/image.jpg',
    required: false
  })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiProperty({
    description: 'Nom du fichier original',
    example: 'capture_ecran.jpg',
    required: false
  })
  @IsOptional()
  @IsString()
  fileName?: string;
}

