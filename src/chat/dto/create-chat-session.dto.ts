import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatSessionDto {
  @ApiProperty({
    description: 'Sujet de la conversation (optionnel)',
    example: 'Question sur ma commande',
    required: false
  })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({
    description: 'Message initial de la conversation',
    example: 'Bonjour, j\'ai une question concernant ma commande #12345.'
  })
  @IsString()
  initialMessage: string;

  @ApiProperty({
    description: 'Priorité de la conversation (0=faible, 1=moyenne, 2=haute, 3=urgente)',
    example: 1,
    minimum: 0,
    maximum: 3,
    required: false,
    default: 0
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3)
  priority?: number;
}

