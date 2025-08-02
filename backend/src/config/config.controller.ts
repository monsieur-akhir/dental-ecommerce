import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ConfigService } from './config.service';
import { Configuration, ConfigurationType } from '../entities/configuration.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '../entities';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  // Initialiser les configurations par défaut (admin seulement)
  @Post('initialize')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async initializeConfigurations(): Promise<{ message: string }> {
    await this.configService.initializeDefaultConfigurations();
    return { message: 'Configurations initialisées avec succès' };
  }

  // Obtenir toutes les configurations publiques
  @Get('public')
  async getPublicConfigs(): Promise<Record<string, any>> {
    return this.configService.getPublicConfigs();
  }

  // Obtenir une configuration spécifique
  @Get(':key')
  async getConfig(@Param('key') key: string): Promise<any> {
    return this.configService.get(key as ConfigurationType);
  }

  // Obtenir plusieurs configurations
  @Post('multiple')
  async getMultipleConfigs(@Body() keys: string[]): Promise<Record<string, any>> {
    return this.configService.getMultiple(keys as ConfigurationType[]);
  }

  // Obtenir toutes les configurations (admin seulement)
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async getAllConfigs(): Promise<Configuration[]> {
    return this.configService['configRepository'].find({
      order: { category: 'ASC', sortOrder: 'ASC' }
    });
  }

  // Obtenir les configurations par catégorie
  @Get('category/:category')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async getConfigsByCategory(@Param('category') category: string): Promise<Configuration[]> {
    return this.configService.getConfigsByCategory(category);
  }

  // Obtenir les catégories disponibles
  @Get('categories/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async getCategories(): Promise<string[]> {
    return this.configService.getCategories();
  }

  // Mettre à jour une configuration (admin seulement)
  @Put(':key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async updateConfig(
    @Param('key') key: string,
    @Body() body: { value: any }
  ): Promise<{ message: string }> {
    await this.configService.set(key as ConfigurationType, body.value);
    return { message: 'Configuration mise à jour avec succès' };
  }

  // Mettre à jour plusieurs configurations (admin seulement)
  @Put('multiple')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async updateMultipleConfigs(
    @Body() configs: Record<string, any>
  ): Promise<{ message: string }> {
    await this.configService.setMultiple(configs as Record<ConfigurationType, any>);
    return { message: 'Configurations mises à jour avec succès' };
  }

  // Créer une nouvelle configuration (admin seulement)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async createConfig(@Body() config: Partial<Configuration>): Promise<Configuration> {
    return this.configService['configRepository'].save(config);
  }

  // Supprimer une configuration (admin seulement)
  @Delete(':key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async deleteConfig(@Param('key') key: string): Promise<{ message: string }> {
    await this.configService['configRepository'].delete({ key: key as ConfigurationType });
    return { message: 'Configuration supprimée avec succès' };
  }

  // Invalider le cache (admin seulement)
  @Post('cache/invalidate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async invalidateCache(): Promise<{ message: string }> {
    this.configService.invalidateCache();
    return { message: 'Cache invalidé avec succès' };
  }

  // Obtenir les configurations pour la page d'accueil
  @Get('homepage/config')
  async getHomepageConfig(): Promise<Record<string, any>> {
    const keys = [
      ConfigurationType.SITE_NAME,
      ConfigurationType.HERO_TITLE,
      ConfigurationType.HERO_SUBTITLE,
      ConfigurationType.HERO_CTA_TEXT,
      ConfigurationType.HERO_CTA_LINK,
      ConfigurationType.HERO_IMAGE,
      ConfigurationType.HERO_PRODUCT_1_IMAGE,
      ConfigurationType.HERO_PRODUCT_1_NAME,
      ConfigurationType.HERO_PRODUCT_2_IMAGE,
      ConfigurationType.HERO_PRODUCT_2_NAME,

      ConfigurationType.CATEGORY_BADGES,
      ConfigurationType.FREE_SHIPPING_THRESHOLD,
      ConfigurationType.CURRENCY_SYMBOL
    ];

    return this.configService.getMultiple(keys);
  }

  // Obtenir les configurations pour le panier
  @Get('cart/config')
  async getCartConfig(): Promise<Record<string, any>> {
    const keys = [
      ConfigurationType.TAX_RATE,
      ConfigurationType.TAX_NAME,
      ConfigurationType.SHIPPING_COST,
      ConfigurationType.FREE_SHIPPING_THRESHOLD,
      ConfigurationType.CURRENCY_SYMBOL,
      ConfigurationType.PAYMENT_METHODS
    ];

    return this.configService.getMultiple(keys);
  }

  // Obtenir les configurations pour les produits
  @Get('products/config')
  async getProductsConfig(): Promise<Record<string, any>> {
    const keys = [
      ConfigurationType.PRODUCTS_PER_PAGE,
      ConfigurationType.FEATURED_PRODUCTS_LIMIT,
      ConfigurationType.BEST_SELLERS_LIMIT,
      ConfigurationType.LOW_STOCK_THRESHOLD,
      ConfigurationType.OUT_OF_STOCK_MESSAGE,
      ConfigurationType.CURRENCY_SYMBOL
    ];

    return this.configService.getMultiple(keys);
  }
} 