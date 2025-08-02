import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

@Entity('reviews')
@Index(['productId', 'status'])
@Index(['userId', 'productId'], { unique: true })
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  productId: number;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'int', comment: 'Note de 1 à 5' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  title: string;

  @Column({ type: 'text' })
  comment: string;

  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.PENDING
  })
  status: ReviewStatus;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'boolean', default: false })
  isHelpful: boolean;

  @Column({ type: 'int', default: 0 })
  helpfulCount: number;

  @Column({ type: 'int', default: 0 })
  notHelpfulCount: number;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Product, product => product.reviews, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => User, user => user.reviews, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Méthodes utilitaires
  isApproved(): boolean {
    return this.status === ReviewStatus.APPROVED;
  }

  isPending(): boolean {
    return this.status === ReviewStatus.PENDING;
  }

  isRejected(): boolean {
    return this.status === ReviewStatus.REJECTED;
  }

  getRatingPercentage(): number {
    return (this.rating / 5) * 100;
  }

  getHelpfulRatio(): number {
    const total = this.helpfulCount + this.notHelpfulCount;
    return total > 0 ? (this.helpfulCount / total) * 100 : 0;
  }
} 