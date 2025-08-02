import { PartialType } from '@nestjs/mapped-types';
import { CreateSmtpConfigDto } from './create-smtp-config.dto';

export class UpdateSmtpConfigDto extends PartialType(CreateSmtpConfigDto) {} 