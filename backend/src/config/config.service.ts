import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Configuration, ConfigurationType, ConfigurationValueType } from '../entities/configuration.entity';

@Injectable()
export class ConfigService {
  private cache: Map<string, any> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes
  private lastCacheUpdate: number = 0;

  constructor(
    @InjectRepository(Configuration)
    private configRepository: Repository<Configuration>
  ) {}

  // Initialiser les configurations par défaut
  async initializeDefaultConfigurations(): Promise<void> {
    const defaultConfigs = [
      // Paramètres généraux
      {
        key: ConfigurationType.SITE_NAME,
        value: 'bd bestdent',
        valueType: ConfigurationValueType.STRING,
        label: 'Nom du site',
        description: 'Nom affiché dans l\'en-tête et le titre de la page',
        category: 'general',
        isPublic: true,
        isRequired: true,
        sortOrder: 1
      },
      {
        key: ConfigurationType.SITE_DESCRIPTION,
        value: 'Votre partenaire de confiance pour les équipements dentaires',
        valueType: ConfigurationValueType.STRING,
        label: 'Description du site',
        description: 'Description utilisée pour le SEO',
        category: 'general',
        isPublic: true,
        isRequired: false,
        sortOrder: 2
      },
      {
        key: ConfigurationType.CONTACT_EMAIL,
        value: 'contact@bestdent.com',
        valueType: ConfigurationValueType.EMAIL,
        label: 'Email de contact',
        description: 'Adresse email principale pour les contacts',
        category: 'contact',
        isPublic: true,
        isRequired: true,
        sortOrder: 1
      },
      {
        key: ConfigurationType.CONTACT_PHONE,
        value: '+33 1 23 45 67 89',
        valueType: ConfigurationValueType.PHONE,
        label: 'Téléphone de contact',
        description: 'Numéro de téléphone principal',
        category: 'contact',
        isPublic: true,
        isRequired: false,
        sortOrder: 2
      },
      {
        key: ConfigurationType.FREE_SHIPPING_THRESHOLD,
        value: '50',
        valueType: ConfigurationValueType.CURRENCY,
        label: 'Seuil de livraison gratuite',
        description: 'Montant minimum pour la livraison gratuite (en euros)',
        category: 'shipping',
        isPublic: true,
        isRequired: true,
        sortOrder: 1
      },
      {
        key: ConfigurationType.SHIPPING_COST,
        value: '8.90',
        valueType: ConfigurationValueType.CURRENCY,
        label: 'Coût de livraison',
        description: 'Coût de livraison standard (en euros)',
        category: 'shipping',
        isPublic: true,
        isRequired: true,
        sortOrder: 2
      },
      {
        key: ConfigurationType.TAX_RATE,
        value: '20',
        valueType: ConfigurationValueType.PERCENTAGE,
        label: 'Taux de TVA',
        description: 'Taux de TVA appliqué (en pourcentage)',
        category: 'tax',
        isPublic: true,
        isRequired: true,
        sortOrder: 1
      },
      {
        key: ConfigurationType.TAX_NAME,
        value: 'TVA',
        valueType: ConfigurationValueType.STRING,
        label: 'Nom de la taxe',
        description: 'Nom affiché pour la taxe',
        category: 'tax',
        isPublic: true,
        isRequired: true,
        sortOrder: 2
      },
      {
        key: ConfigurationType.CURRENCY,
        value: 'EUR',
        valueType: ConfigurationValueType.STRING,
        label: 'Devise',
        description: 'Code de la devise utilisée',
        category: 'payment',
        isPublic: true,
        isRequired: true,
        sortOrder: 1
      },
      {
        key: ConfigurationType.CURRENCY_SYMBOL,
        value: '€',
        valueType: ConfigurationValueType.STRING,
        label: 'Symbole de la devise',
        description: 'Symbole affiché pour la devise',
        category: 'payment',
        isPublic: true,
        isRequired: true,
        sortOrder: 2
      },
      {
        key: ConfigurationType.PAYMENT_METHODS,
        value: JSON.stringify(['credit_card', 'paypal', 'bank_transfer']),
        valueType: ConfigurationValueType.JSON,
        label: 'Méthodes de paiement',
        description: 'Méthodes de paiement acceptées',
        category: 'payment',
        isPublic: true,
        isRequired: true,
        sortOrder: 3
      },
      // Paramètres de la page d'accueil
      {
        key: ConfigurationType.HERO_TITLE,
        value: 'QUALITÉ À PRIX ACCESSIBLE !',
        valueType: ConfigurationValueType.STRING,
        label: 'Titre de la bannière principale',
        description: 'Titre principal affiché sur la bannière de la page d\'accueil',
        category: 'homepage',
        isPublic: true,
        isRequired: true,
        sortOrder: 1
      },
      {
        key: ConfigurationType.HERO_SUBTITLE,
        value: 'Le meilleur de Bestdent.',
        valueType: ConfigurationValueType.STRING,
        label: 'Sous-titre de la bannière principale',
        description: 'Sous-titre affiché sous le titre principal',
        category: 'homepage',
        isPublic: true,
        isRequired: false,
        sortOrder: 2
      },
      {
        key: ConfigurationType.HERO_CTA_TEXT,
        value: 'Découvrir maintenant !',
        valueType: ConfigurationValueType.STRING,
        label: 'Texte du bouton CTA',
        description: 'Texte affiché sur le bouton d\'appel à l\'action',
        category: 'homepage',
        isPublic: true,
        isRequired: true,
        sortOrder: 3
      },
      {
        key: ConfigurationType.HERO_CTA_LINK,
        value: '/products',
        valueType: ConfigurationValueType.URL,
        label: 'Lien du bouton CTA',
        description: 'Lien vers lequel redirige le bouton d\'appel à l\'action',
        category: 'homepage',
        isPublic: true,
        isRequired: true,
        sortOrder: 4
      },
      {
        key: ConfigurationType.HERO_IMAGE,
        value: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        valueType: ConfigurationValueType.IMAGE,
        label: 'Image de la bannière principale',
        description: 'Image de fond de la bannière principale',
        category: 'homepage',
        isPublic: true,
        isRequired: false,
        sortOrder: 5
      },
      {
        key: ConfigurationType.HERO_PRODUCT_1_IMAGE,
        value: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
        valueType: ConfigurationValueType.IMAGE,
        label: 'Image du produit 1 de la bannière',
        description: 'Image du premier produit affiché dans la bannière',
        category: 'homepage',
        isPublic: true,
        isRequired: false,
        sortOrder: 6
      },
      {
        key: ConfigurationType.HERO_PRODUCT_1_NAME,
        value: 'Fil dentaire',
        valueType: ConfigurationValueType.STRING,
        label: 'Nom du produit 1 de la bannière',
        description: 'Nom du premier produit affiché dans la bannière',
        category: 'homepage',
        isPublic: true,
        isRequired: false,
        sortOrder: 7
      },
      {
        key: ConfigurationType.HERO_PRODUCT_2_IMAGE,
        value: 'https://images.unsplash.com/photo-1581595219315-a187dd40c322?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
        valueType: ConfigurationValueType.IMAGE,
        label: 'Image du produit 2 de la bannière',
        description: 'Image du deuxième produit affiché dans la bannière',
        category: 'homepage',
        isPublic: true,
        isRequired: false,
        sortOrder: 8
      },
      {
        key: ConfigurationType.HERO_PRODUCT_2_NAME,
        value: 'Gants jetables',
        valueType: ConfigurationValueType.STRING,
        label: 'Nom du produit 2 de la bannière',
        description: 'Nom du deuxième produit affiché dans la bannière',
        category: 'homepage',
        isPublic: true,
        isRequired: false,
        sortOrder: 9
      },

      // Paramètres des catégories
      {
        key: ConfigurationType.CATEGORY_BADGES,
        value: JSON.stringify({
          'CONSOMMABLES': 'WOW!!',
          'MATÉRIAUX D\'EMPREINTE': 'COOL!',
          'RESTAURATION': 'TOP!',
          'ENDODONTIE': 'SUPER',
          'CIMENTS': 'HOT!',
          'PRÉVENTION ET PROPHYLAXIE': 'NEW!',
          'DÉSINFECTION': 'BEST!',
          'MINIATURES ET DÉTARTRAGE': 'POPULAR',
          'AUTRES PRODUITS': 'SPECIAL'
        }),
        valueType: ConfigurationValueType.JSON,
        label: 'Badges des catégories',
        description: 'Badges affichés pour chaque catégorie de produits',
        category: 'categories',
        isPublic: true,
        isRequired: false,
        sortOrder: 1
      },
      // Paramètres d'affichage
      {
        key: ConfigurationType.PRODUCTS_PER_PAGE,
        value: '12',
        valueType: ConfigurationValueType.NUMBER,
        label: 'Produits par page',
        description: 'Nombre de produits affichés par page',
        category: 'display',
        isPublic: true,
        isRequired: true,
        sortOrder: 1
      },
      {
        key: ConfigurationType.FEATURED_PRODUCTS_LIMIT,
        value: '8',
        valueType: ConfigurationValueType.NUMBER,
        label: 'Limite produits vedettes',
        description: 'Nombre maximum de produits vedettes affichés',
        category: 'display',
        isPublic: true,
        isRequired: true,
        sortOrder: 2
      },
      {
        key: ConfigurationType.BEST_SELLERS_LIMIT,
        value: '6',
        valueType: ConfigurationValueType.NUMBER,
        label: 'Limite meilleures ventes',
        description: 'Nombre maximum de meilleures ventes affichées',
        category: 'display',
        isPublic: true,
        isRequired: true,
        sortOrder: 3
      },
      // Paramètres de stock
      {
        key: ConfigurationType.LOW_STOCK_THRESHOLD,
        value: '10',
        valueType: ConfigurationValueType.NUMBER,
        label: 'Seuil de stock faible',
        description: 'Seuil en dessous duquel le stock est considéré comme faible',
        category: 'stock',
        isPublic: false,
        isRequired: true,
        sortOrder: 1
      },
      {
        key: ConfigurationType.OUT_OF_STOCK_MESSAGE,
        value: 'Rupture de stock',
        valueType: ConfigurationValueType.STRING,
        label: 'Message de rupture de stock',
        description: 'Message affiché quand un produit est en rupture',
        category: 'stock',
        isPublic: true,
        isRequired: true,
        sortOrder: 2
      },
      // Paramètres de sécurité
      {
        key: ConfigurationType.PASSWORD_MIN_LENGTH,
        value: '8',
        valueType: ConfigurationValueType.NUMBER,
        label: 'Longueur minimale du mot de passe',
        description: 'Longueur minimale requise pour les mots de passe',
        category: 'security',
        isPublic: false,
        isRequired: true,
        sortOrder: 1
      },
      {
        key: ConfigurationType.SESSION_TIMEOUT,
        value: '3600',
        valueType: ConfigurationValueType.NUMBER,
        label: 'Timeout de session (secondes)',
        description: 'Durée de vie de la session en secondes',
        category: 'security',
        isPublic: false,
        isRequired: true,
        sortOrder: 2
      },
      // Paramètres de maintenance
      {
        key: ConfigurationType.MAINTENANCE_MODE,
        value: 'false',
        valueType: ConfigurationValueType.BOOLEAN,
        label: 'Mode maintenance',
        description: 'Activer le mode maintenance pour empêcher l\'accès au site',
        category: 'maintenance',
        isPublic: false,
        isRequired: true,
        sortOrder: 1
      },
      {
        key: ConfigurationType.MAINTENANCE_MESSAGE,
        value: 'Site en maintenance. Merci de revenir plus tard.',
        valueType: ConfigurationValueType.STRING,
        label: 'Message de maintenance',
        description: 'Message affiché quand le site est en maintenance',
        category: 'maintenance',
        isPublic: true,
        isRequired: false,
        sortOrder: 2
      }
    ];

    for (const config of defaultConfigs) {
      const existingConfig = await this.configRepository.findOne({
        where: { key: config.key }
      });

      if (!existingConfig) {
        const newConfig = this.configRepository.create(config);
        await this.configRepository.save(newConfig);
      }
    }
  }

  // Obtenir une configuration par clé
  async get(key: ConfigurationType): Promise<any> {
    // Vérifier le cache
    if (this.isCacheValid() && this.cache.has(key)) {
      return this.cache.get(key);
    }

    const config = await this.configRepository.findOne({
      where: { key }
    });

    if (!config) {
      return null;
    }

    const value = config.getValue();
    
    // Mettre en cache
    this.cache.set(key, value);
    
    return value;
  }

  // Obtenir plusieurs configurations
  async getMultiple(keys: ConfigurationType[]): Promise<Record<string, any>> {
    const result: Record<string, any> = {};
    
    for (const key of keys) {
      result[key] = await this.get(key);
    }
    
    return result;
  }

  // Obtenir toutes les configurations publiques
  async getPublicConfigs(): Promise<Record<string, any>> {
    const configs = await this.configRepository.find({
      where: { isPublic: true },
      order: { category: 'ASC', sortOrder: 'ASC' }
    });

    const result: Record<string, any> = {};
    for (const config of configs) {
      result[config.key] = config.getValue();
    }

    return result;
  }

  // Obtenir toutes les configurations par catégorie
  async getConfigsByCategory(category: string): Promise<Configuration[]> {
    return this.configRepository.find({
      where: { category },
      order: { sortOrder: 'ASC' }
    });
  }

  // Mettre à jour une configuration
  async set(key: ConfigurationType, value: any): Promise<void> {
    const config = await this.configRepository.findOne({
      where: { key }
    });

    if (!config) {
      throw new Error(`Configuration ${key} not found`);
    }

    config.setValue(value);
    await this.configRepository.save(config);

    // Invalider le cache
    this.cache.delete(key);
  }

  // Mettre à jour plusieurs configurations
  async setMultiple(configs: Record<ConfigurationType, any>): Promise<void> {
    for (const [key, value] of Object.entries(configs)) {
      await this.set(key as ConfigurationType, value);
    }
  }

  // Vérifier si le cache est valide
  private isCacheValid(): boolean {
    return Date.now() - this.lastCacheUpdate < this.cacheTimeout;
  }

  // Invalider le cache
  invalidateCache(): void {
    this.cache.clear();
    this.lastCacheUpdate = 0;
  }

  // Obtenir les catégories disponibles
  async getCategories(): Promise<string[]> {
    const categories = await this.configRepository
      .createQueryBuilder('config')
      .select('DISTINCT config.category', 'category')
      .orderBy('config.category', 'ASC')
      .getRawMany();

    return categories.map(c => c.category);
  }
} 