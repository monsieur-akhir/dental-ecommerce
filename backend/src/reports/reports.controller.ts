import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '../entities';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleType.ADMIN)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  async getSalesReport(@Query('period') period: '7d' | '30d' | '90d' | '1y' = '30d') {
    console.log('📊 Demande de rapport des ventes pour la période:', period);
    try {
      const report = await this.reportsService.getSalesReport(period);
      console.log('✅ Rapport des ventes généré avec succès');
      return report;
    } catch (error) {
      console.error('❌ Erreur lors de la génération du rapport des ventes:', error);
      throw error;
    }
  }

  @Get('orders')
  async getOrdersReport(@Query('period') period: '7d' | '30d' | '90d' | '1y' = '30d') {
    console.log('📦 Demande de rapport des commandes pour la période:', period);
    try {
      const report = await this.reportsService.getOrdersReport(period);
      console.log('✅ Rapport des commandes généré avec succès');
      return report;
    } catch (error) {
      console.error('❌ Erreur lors de la génération du rapport des commandes:', error);
      throw error;
    }
  }

  @Get('products')
  async getProductsReport() {
    console.log('🏷️ Demande de rapport des produits');
    try {
      const report = await this.reportsService.getProductsReport();
      console.log('✅ Rapport des produits généré avec succès');
      return report;
    } catch (error) {
      console.error('❌ Erreur lors de la génération du rapport des produits:', error);
      throw error;
    }
  }

  @Get('users')
  async getUsersReport(@Query('period') period: '7d' | '30d' | '90d' | '1y' = '30d') {
    console.log('👥 Demande de rapport des utilisateurs pour la période:', period);
    try {
      const report = await this.reportsService.getUsersReport(period);
      console.log('✅ Rapport des utilisateurs généré avec succès');
      return report;
    } catch (error) {
      console.error('❌ Erreur lors de la génération du rapport des utilisateurs:', error);
      throw error;
    }
  }

  @Get('complete')
  async getCompleteReport(@Query('period') period: '7d' | '30d' | '90d' | '1y' = '30d') {
    console.log('📈 Demande de rapport complet pour la période:', period);
    try {
      const report = await this.reportsService.getCompleteReport(period);
      console.log('✅ Rapport complet généré avec succès');
      return report;
    } catch (error) {
      console.error('❌ Erreur lors de la génération du rapport complet:', error);
      throw error;
    }
  }
} 