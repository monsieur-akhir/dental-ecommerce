import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';

export enum ConfigurationType {
  // Paramètres généraux
  SITE_NAME = 'site_name',
  SITE_DESCRIPTION = 'site_description',
  SITE_LOGO = 'site_logo',
  SITE_FAVICON = 'site_favicon',
  
  // Paramètres de contact
  CONTACT_EMAIL = 'contact_email',
  CONTACT_PHONE = 'contact_phone',
  CONTACT_ADDRESS = 'contact_address',
  
  // Paramètres de livraison
  FREE_SHIPPING_THRESHOLD = 'free_shipping_threshold',
  SHIPPING_COST = 'shipping_cost',
  SHIPPING_TIME = 'shipping_time',
  
  // Paramètres fiscaux
  TAX_RATE = 'tax_rate',
  TAX_NAME = 'tax_name',
  
  // Paramètres de paiement
  PAYMENT_METHODS = 'payment_methods',
  CURRENCY = 'currency',
  CURRENCY_SYMBOL = 'currency_symbol',
  
  // Paramètres de la page d'accueil
  HERO_TITLE = 'hero_title',
  HERO_SUBTITLE = 'hero_subtitle',
  HERO_CTA_TEXT = 'hero_cta_text',
  HERO_CTA_LINK = 'hero_cta_link',
  HERO_IMAGE = 'hero_image',
  HERO_PRODUCT_1_IMAGE = 'hero_product_1_image',
  HERO_PRODUCT_1_NAME = 'hero_product_1_name',
  HERO_PRODUCT_2_IMAGE = 'hero_product_2_image',
  HERO_PRODUCT_2_NAME = 'hero_product_2_name',
  

  
  // Paramètres des catégories
  CATEGORY_BADGES = 'category_badges',
  
  // Paramètres SEO
  META_TITLE = 'meta_title',
  META_DESCRIPTION = 'meta_description',
  META_KEYWORDS = 'meta_keywords',
  
  // Paramètres sociaux
  FACEBOOK_URL = 'facebook_url',
  TWITTER_URL = 'twitter_url',
  INSTAGRAM_URL = 'instagram_url',
  LINKEDIN_URL = 'linkedin_url',
  
  // Paramètres de maintenance
  MAINTENANCE_MODE = 'maintenance_mode',
  MAINTENANCE_MESSAGE = 'maintenance_message',
  
  // Paramètres de sécurité
  PASSWORD_MIN_LENGTH = 'password_min_length',
  SESSION_TIMEOUT = 'session_timeout',
  
  // Paramètres de notification
  EMAIL_NOTIFICATIONS = 'email_notifications',
  SMS_NOTIFICATIONS = 'sms_notifications',
  
  // Paramètres d'affichage
  PRODUCTS_PER_PAGE = 'products_per_page',
  FEATURED_PRODUCTS_LIMIT = 'featured_products_limit',
  BEST_SELLERS_LIMIT = 'best_sellers_limit',
  
  // Paramètres de réduction
  DEFAULT_DISCOUNT_PERCENTAGE = 'default_discount_percentage',
  WELCOME_DISCOUNT_PERCENTAGE = 'welcome_discount_percentage',
  
  // Paramètres de stock
  LOW_STOCK_THRESHOLD = 'low_stock_threshold',
  OUT_OF_STOCK_MESSAGE = 'out_of_stock_message',
  
  // Paramètres de réputation
  MIN_REVIEWS_FOR_RATING = 'min_reviews_for_rating',
  AUTO_APPROVE_REVIEWS = 'auto_approve_reviews',
  
  // Paramètres de cache
  CACHE_DURATION = 'cache_duration',
  CACHE_ENABLED = 'cache_enabled'
}

export enum ConfigurationValueType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
  IMAGE = 'image',
  COLOR = 'color',
  EMAIL = 'email',
  URL = 'url',
  PHONE = 'phone',
  PERCENTAGE = 'percentage',
  CURRENCY = 'currency'
}

@Entity('configurations')
export class Configuration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ConfigurationType,
    unique: true
  })
  key: ConfigurationType;

  @Column('text')
  value: string;

  @Column({
    type: 'enum',
    enum: ConfigurationValueType,
    default: ConfigurationValueType.STRING
  })
  valueType: ConfigurationValueType;

  @Column('varchar', { length: 255 })
  label: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('varchar', { length: 50, default: 'general' })
  category: string;

  @Column('boolean', { default: true })
  isPublic: boolean;

  @Column('boolean', { default: false })
  isRequired: boolean;

  @Column('int', { default: 0 })
  sortOrder: number;

  @Column('varchar', { length: 100, nullable: true })
  validation: string;

  @Column('text', { nullable: true })
  defaultValue: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Méthodes utilitaires
  getValue(): any {
    switch (this.valueType) {
      case ConfigurationValueType.NUMBER:
        return parseFloat(this.value);
      case ConfigurationValueType.BOOLEAN:
        return this.value === 'true';
      case ConfigurationValueType.JSON:
        try {
          return JSON.parse(this.value);
        } catch {
          return this.value;
        }
      case ConfigurationValueType.PERCENTAGE:
        return parseFloat(this.value);
      default:
        return this.value;
    }
  }

  setValue(value: any): void {
    switch (this.valueType) {
      case ConfigurationValueType.JSON:
        this.value = JSON.stringify(value);
        break;
      case ConfigurationValueType.BOOLEAN:
        this.value = value ? 'true' : 'false';
        break;
      default:
        this.value = String(value);
    }
  }
} 