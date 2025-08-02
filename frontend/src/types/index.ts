export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  isActive: boolean;
  role: Role;
  token?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: 'admin' | 'client';
  description?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  products?: Product[];
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  stockQuantity: number;
  stock?: number;
  sku?: string;
  barcode?: string;
  weight?: number;
  dimensions?: string;
  brand?: string;
  specifications?: string;
  isActive: boolean;
  isFeatured: boolean;
  featured?: boolean;
  new?: boolean;
  viewCount: number;
  salesCount: number;
  rating?: number;
  reviewCount?: number;
  category?: Category;
  categories: Category[];
  images: Image[];
  features?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Image {
  id: number;
  filename: string;
  originalName: string;
  url: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
  productId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  billingAddress?: string;
  billingCity?: string;
  billingPostalCode?: string;
  billingCountry?: string;
  notes?: string;
  trackingNumber?: string;
  user: User;
  orderItems: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: Product;
  createdAt: string;
  updatedAt: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  CASH_ON_DELIVERY = 'cash_on_delivery',
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface CreateOrderData {
  paymentMethod: PaymentMethod;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  billingAddress?: string;
  billingCity?: string;
  billingPostalCode?: string;
  billingCountry?: string;
  notes?: string;
  items: {
    productId: number;
    quantity: number;
    unitPrice: number;
  }[];
}

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

export interface Configuration {
  id: number;
  key: ConfigurationType;
  value: string;
  valueType: ConfigurationValueType;
  label: string;
  description?: string;
  category: string;
  isPublic: boolean;
  isRequired: boolean;
  sortOrder: number;
  validation?: string;
  defaultValue?: string;
  createdAt: string;
  updatedAt: string;
}

