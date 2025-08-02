import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmtpConfigService } from './smtp-config.service';
import { SmtpConfigController } from './smtp-config.controller';
import { SmtpConfig } from '../entities';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([SmtpConfig]), EmailModule],
  controllers: [SmtpConfigController],
  providers: [SmtpConfigService],
  exports: [SmtpConfigService],
})
export class SmtpConfigModule {} 