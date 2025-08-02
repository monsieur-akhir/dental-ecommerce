import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Promotion } from './promotion.entity';
import { PromoCode } from './promo-code.entity';
import { Order } from './order.entity';

@Entity('user_promotions')
export class UserPromotion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  discountAmount: number;

  @Column('json', { nullable: true })
  appliedConditions: any; // Conditions qui étaient actives lors de l'utilisation

  @Column('json', { nullable: true })
  metadata: any;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Promotion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'promotionId' })
  promotion: Promotion;

  @ManyToOne(() => PromoCode, promoCode => promoCode.userPromotions, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'promoCodeId' })
  promoCode: PromoCode;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @CreateDateColumn()
  usedAt: Date;

  // Propriétés pour les relations
  userId: number;
  promotionId: number;
  promoCodeId: number;
  orderId: number;
}

