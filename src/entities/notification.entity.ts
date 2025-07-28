import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum NotificationType {
  ORDER_CONFIRMED = 'order_confirmed',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  PRODUCT_BACK_IN_STOCK = 'product_back_in_stock',
  PROMOTION_AVAILABLE = 'promotion_available',
  WISHLIST_PRICE_DROP = 'wishlist_price_drop',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  ACCOUNT_UPDATE = 'account_update',
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.UNREAD,
  })
  status: NotificationStatus;

  @Column({ nullable: true })
  actionUrl: string;

  @Column('json', { nullable: true })
  metadata: any;

  @Column({ default: false })
  isPush: boolean;

  @Column({ nullable: true })
  pushSentAt: Date;

  @ManyToOne(() => User, user => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Propriété pour la relation
  userId: number;
}

