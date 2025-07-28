import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { Image } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Image])],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}

