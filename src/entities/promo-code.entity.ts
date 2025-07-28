import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Promotion } from './promotion.entity';
import { UserPromotion } from './user-promotion.entity';

@Entity('promo_codes')
export class PromoCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'datetime', nullable: true })
  expiresAt: Date;

  @Column({ default: 0 })
  usageLimit: number; // 0 = illimité

  @Column({ default: 0 })
  usageCount: number;

  @Column({ default: 1 })
  usageLimitPerUser: number;

  @Column('json', { nullable: true })
  metadata: any;

  @ManyToOne(() => Promotion, promotion => promotion.promoCodes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'promotionId' })
  promotion: Promotion;

  @OneToMany(() => UserPromotion, userPromotion => userPromotion.promoCode)
  userPromotions: UserPromotion[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Propriété pour la relation
  promotionId: number;
}

