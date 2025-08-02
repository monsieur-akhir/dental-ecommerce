import { ConfigurationType } from '../types';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface ConfigData {
  [key: string]: any;
}

class ConfigService {
  private cache: Map<string, any> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes
  private lastCacheUpdate: number = 0;

  // Obtenir toutes les configurations publiques
  async getPublicConfigs(): Promise<ConfigData> {
    if (this.isCacheValid() && this.cache.has('public')) {
      return this.cache.get('public');
    }

    try {
      const response = await api.get('/config/public'); // Use axios instance
      const data = response.data;
      this.cache.set('public', data);
      this.lastCacheUpdate = Date.now();
      
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
      return this.getDefaultConfigs();
    }
  }

  // Obtenir une configuration spécifique
  async get(key: ConfigurationType): Promise<any> {
    const configs = await this.getPublicConfigs();
    return configs[key] || null;
  }

  // Obtenir plusieurs configurations
  async getMultiple(keys: ConfigurationType[]): Promise<ConfigData> {
    const configs = await this.getPublicConfigs();
    const result: ConfigData = {};
    
    keys.forEach(key => {
      result[key] = configs[key] || null;
    });
    
    return result;
  }

  // Obtenir la configuration pour la page d'accueil
  async getHomepageConfig(): Promise<ConfigData> {
    try {
      const response = await api.get('/config/homepage/config'); // Use axios instance
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration de la page d\'accueil:', error);
      return this.getDefaultHomepageConfig();
    }
  }

  // Obtenir la configuration pour le panier
  async getCartConfig(): Promise<ConfigData> {
    try {
      const response = await api.get('/config/cart/config'); // Use axios instance
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration du panier:', error);
      return this.getDefaultCartConfig();
    }
  }

  // Obtenir la configuration pour les produits
  async getProductsConfig(): Promise<ConfigData> {
    try {
      const response = await api.get('/config/products/config'); // Use axios instance
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration des produits:', error);
      return this.getDefaultProductsConfig();
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

  // Configurations par défaut
  private getDefaultConfigs(): ConfigData {
    return {
      site_name: 'DentalPro',
      site_description: 'Votre partenaire de confiance pour les équipements dentaires',
      contact_email: 'contact@dentalpro.com',
      contact_phone: '+33 1 23 45 67 89',
      contact_address: '123 Rue de la Santé, 75001 Paris, France',
      social_facebook: 'https://facebook.com/dentalpro',
      social_twitter: 'https://twitter.com/dentalpro',
      social_linkedin: 'https://linkedin.com/company/dentalpro',
      social_instagram: 'https://instagram.com/dentalpro',
      free_shipping_threshold: '50',
      shipping_cost: '8.90',
      tax_rate: '20',
      tax_name: 'TVA',
      currency: 'EUR',
      currency_symbol: '€',
      payment_methods: ['credit_card', 'paypal', 'bank_transfer'],
      products_per_page: '12',
      featured_products_limit: '8',
      best_sellers_limit: '6',
      low_stock_threshold: '10',
      out_of_stock_message: 'Rupture de stock',
      hero_title: 'QUALITÉ À PRIX ACCESSIBLE !',
      hero_subtitle: 'Le meilleur de Bestdent.',
      hero_cta_text: 'Découvrir maintenant !',
      hero_cta_link: '/products',
      hero_image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      hero_product_1_image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      hero_product_1_name: 'Fil dentaire',
      hero_product_2_image: 'https://images.unsplash.com/photo-1581595219315-a187dd40c322?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      hero_product_2_name: 'Gants jetables',
      category_badges: {
        'CONSOMMABLES': 'WOW!!',
        'MATÉRIAUX D\'EMPREINTE': 'COOL!',
        'RESTAURATION': 'TOP!',
        'ENDODONTIE': 'SUPER',
        'CIMENTS': 'HOT!',
        'PRÉVENTION ET PROPHYLAXIE': 'NEW!',
        'DÉSINFECTION': 'BEST!',
        'MINIATURES ET DÉTARTRAGE': 'POPULAR',
        'AUTRES PRODUITS': 'SPECIAL'
      },
      product_filters_enabled: true,
      product_sort_options: ['price_asc', 'price_desc', 'name_asc', 'name_desc', 'createdAt_desc'],
      cart_min_total: '10',
      cart_max_items: '100',
      checkout_guest_enabled: true,
      order_tracking_enabled: true,
      shipping_methods: ['standard', 'express'],
      review_moderation_enabled: true,
      promotion_banners_enabled: true,
      newsletter_enabled: true,
      contact_form_enabled: true,
      faq_enabled: true,
      about_us_enabled: true,
      privacy_policy_enabled: true,
      terms_of_service_enabled: true,
      return_policy_enabled: true,
      cookie_consent_enabled: true,
      maintenance_mode: false,
      admin_email: 'admin@dentalpro.com',
      admin_phone: '+33 1 98 76 54 32',
      admin_address: '456 Avenue de la Technologie, 75002 Paris, France',
      admin_dashboard_stats_enabled: true,
      admin_product_management_enabled: true,
      admin_order_management_enabled: true,
      admin_user_management_enabled: true,
      admin_category_management_enabled: true,
      admin_promotion_management_enabled: true,
      admin_review_management_enabled: true,
      admin_configuration_management_enabled: true,
      admin_report_generation_enabled: true,
      admin_smtp_config_enabled: true,
    };
  }

  private getDefaultHomepageConfig(): ConfigData {
    return {
      hero_title: 'QUALITÉ À PRIX ACCESSIBLE !',
      hero_subtitle: 'Le meilleur de Bestdent.',
      hero_cta_text: 'Découvrir maintenant !',
      hero_cta_link: '/products',
      hero_image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      hero_product_1_image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      hero_product_1_name: 'Fil dentaire',
      hero_product_2_image: 'https://images.unsplash.com/photo-1581595219315-a187dd40c322?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      hero_product_2_name: 'Gants jetables',
      category_badges: {
        'CONSOMMABLES': 'WOW!!',
        'MATÉRIAUX D\'EMPREINTE': 'COOL!',
        'RESTAURATION': 'TOP!',
        'ENDODONTIE': 'SUPER',
        'CIMENTS': 'HOT!',
        'PRÉVENTION ET PROPHYLAXIE': 'NEW!',
        'DÉSINFECTION': 'BEST!',
        'MINIATURES ET DÉTARTRAGE': 'POPULAR',
        'AUTRES PRODUITS': 'SPECIAL'
      },
      site_name: 'DentalPro',
      free_shipping_threshold: '50',
      currency_symbol: '€'
    };
  }

  private getDefaultCartConfig(): ConfigData {
    return {
      tax_rate: '20',
      tax_name: 'TVA',
      shipping_cost: '8.90',
      free_shipping_threshold: '50',
      currency_symbol: '€',
      payment_methods: ['credit_card', 'paypal', 'bank_transfer'],
      cart_min_total: '10',
      cart_max_items: '100'
    };
  }

  private getDefaultProductsConfig(): ConfigData {
    return {
      products_per_page: '12',
      featured_products_limit: '8',
      best_sellers_limit: '6',
      low_stock_threshold: '10',
      out_of_stock_message: 'Rupture de stock',
      currency_symbol: '€',
      product_filters_enabled: true,
      product_sort_options: ['price_asc', 'price_desc', 'name_asc', 'name_desc', 'createdAt_desc']
    };
  }
}

// Instance singleton
const configService = new ConfigService();

export default configService; 