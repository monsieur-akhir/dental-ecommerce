import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Category } from './category.entity';
import { PromoCode } from './promo-code.entity';

export enum PromotionType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  FREE_SHIPPING = 'free_shipping',
  BUY_X_GET_Y = 'buy_x_get_y',
}

export enum PromotionStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired',
}

@Entity('promotions')
export class Promotion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PromotionType,
  })
  type: PromotionType;

  @Column({
    type: 'enum',
    enum: PromotionStatus,
    default: PromotionStatus.DRAFT,
  })
  status: PromotionStatus;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  discountValue: number; // Pourcentage ou montant fixe

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  minimumOrderAmount: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  maximumDiscountAmount: number; // Pour limiter les réductions en pourcentage

  @Column({ nullable: true })
  buyQuantity: number; // Pour buy_x_get_y

  @Column({ nullable: true })
  getQuantity: number; // Pour buy_x_get_y

  @Column({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime' })
  endDate: Date;

  @Column({ default: 0 })
  usageLimit: number; // 0 = illimité

  @Column({ default: 0 })
  usageCount: number;

  @Column({ default: 1 })
  usageLimitPerUser: number;

  @Column({ default: false })
  isStackable: boolean; // Peut être combinée avec d'autres promotions

  @Column({ default: false })
  applyToSale: boolean; // S'applique aux produits déjà en promotion

  @Column('json', { nullable: true })
  conditions: any; // Conditions supplémentaires

  @Column('json', { nullable: true })
  metadata: any;

  @ManyToMany(() => Product, { nullable: true })
  @JoinTable({
    name: 'promotion_products',
    joinColumn: { name: 'promotionId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'productId', referencedColumnName: 'id' },
  })
  products: Product[];

  @ManyToMany(() => Category, { nullable: true })
  @JoinTable({
    name: 'promotion_categories',
    joinColumn: { name: 'promotionId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
  })
  categories: Category[];

  @OneToMany(() => PromoCode, promoCode => promoCode.promotion)
  promoCodes: PromoCode[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

