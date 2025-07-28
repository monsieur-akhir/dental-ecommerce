import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComparisonController } from './comparison.controller';
import { ComparisonService } from './comparison.service';
import { Comparison, Product } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Comparison, Product])],
  controllers: [ComparisonController],
  providers: [ComparisonService],
  exports: [ComparisonService],
})
export class ComparisonModule {}
