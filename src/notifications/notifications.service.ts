import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification, NotificationStatus, NotificationType } from '../entities/notification.entity';
import { User } from '../entities/user.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createNotification(
    userId: number,
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
    }

    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      userId,
      pushSentAt: createNotificationDto.isPush ? new Date() : undefined,
    });

    const savedNotification = await this.notificationRepository.save(notification);

    // TODO: Implémenter l'envoi de notification push si isPush = true
    if (createNotificationDto.isPush && user.pushToken && user.notificationsEnabled) {
      await this.sendPushNotification(user.pushToken, savedNotification);
    }

    return savedNotification;
  }

  async createBulkNotification(
    userIds: number[],
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification[]> {
    const users = await this.userRepository.find({ where: { id: In(userIds) } });
    const notifications = users.map(user =>
      this.notificationRepository.create({
        ...createNotificationDto,
        userId: user.id,
        pushSentAt: createNotificationDto.isPush ? new Date() : undefined,
      }),
    );

    const savedNotifications = await this.notificationRepository.save(notifications);

    // Envoyer les notifications push si nécessaire
    if (createNotificationDto.isPush) {
      for (const user of users) {
        if (user.pushToken && user.notificationsEnabled) {
          const userNotification = savedNotifications.find(n => n.userId === user.id);
          if (userNotification) {
            await this.sendPushNotification(user.pushToken, userNotification);
          }
        }
      }
    }

    return savedNotifications;
  }

  async getUserNotifications(
    userId: number,
    page: number = 1,
    limit: number = 20,
    status?: NotificationStatus,
  ): Promise<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
  }> {
    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('notification.status = :status', { status });
    }

    const [notifications, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const unreadCount = await this.notificationRepository.count({
      where: { userId, status: NotificationStatus.UNREAD },
    });

    return { notifications, total, unreadCount };
  }

  async markAsRead(userId: number, notificationId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification non trouvée');
    }

    notification.status = NotificationStatus.READ;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update(
      { userId, status: NotificationStatus.UNREAD },
      { status: NotificationStatus.READ },
    );
  }

  async deleteNotification(userId: number, notificationId: number): Promise<void> {
    const result = await this.notificationRepository.delete({
      id: notificationId,
      userId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Notification non trouvée');
    }
  }

  async getNotificationStats(userId: number): Promise<{
    total: number;
    unread: number;
    byType: Record<NotificationType, number>;
  }> {
    const total = await this.notificationRepository.count({ where: { userId } });
    const unread = await this.notificationRepository.count({
      where: { userId, status: NotificationStatus.UNREAD },
    });

    const byTypeQuery = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('notification.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('notification.userId = :userId', { userId })
      .groupBy('notification.type')
      .getRawMany();

    const byType = byTypeQuery.reduce((acc, item) => {
      acc[item.type] = parseInt(item.count);
      return acc;
    }, {} as Record<NotificationType, number>);

    return { total, unread, byType };
  }

  async updatePushToken(userId: number, pushToken: string): Promise<void> {
    await this.userRepository.update(userId, { pushToken });
  }

  async toggleNotifications(userId: number, enabled: boolean): Promise<void> {
    await this.userRepository.update(userId, { notificationsEnabled: enabled });
  }

  // Méthodes utilitaires pour créer des notifications spécifiques
  async notifyOrderConfirmed(userId: number, orderId: number, orderTotal: number): Promise<void> {
    await this.createNotification(userId, {
      type: NotificationType.ORDER_CONFIRMED,
      title: 'Commande confirmée',
      message: `Votre commande #${orderId} d'un montant de ${orderTotal}€ a été confirmée.`,
      actionUrl: `/orders/${orderId}`,
      metadata: { orderId, orderTotal },
      isPush: true,
    });
  }

  async notifyOrderShipped(userId: number, orderId: number, trackingNumber?: string): Promise<void> {
    await this.createNotification(userId, {
      type: NotificationType.ORDER_SHIPPED,
      title: 'Commande expédiée',
      message: trackingNumber
        ? `Votre commande #${orderId} a été expédiée. Numéro de suivi: ${trackingNumber}`
        : `Votre commande #${orderId} a été expédiée.`,
      actionUrl: `/orders/${orderId}`,
      metadata: { orderId, trackingNumber },
      isPush: true,
    });
  }

  async notifyProductBackInStock(userId: number, productId: number, productName: string): Promise<void> {
    await this.createNotification(userId, {
      type: NotificationType.PRODUCT_BACK_IN_STOCK,
      title: 'Produit de nouveau en stock',
      message: `Le produit "${productName}" que vous suivez est de nouveau disponible !`,
      actionUrl: `/products/${productId}`,
      metadata: { productId, productName },
      isPush: true,
    });
  }

  async notifyWishlistPriceDrop(
    userId: number,
    productId: number,
    productName: string,
    oldPrice: number,
    newPrice: number,
  ): Promise<void> {
    const discount = ((oldPrice - newPrice) / oldPrice * 100).toFixed(0);
    await this.createNotification(userId, {
      type: NotificationType.WISHLIST_PRICE_DROP,
      title: 'Baisse de prix sur votre liste de souhaits',
      message: `Le prix de "${productName}" a baissé de ${discount}% ! Nouveau prix: ${newPrice}€`,
      actionUrl: `/products/${productId}`,
      metadata: { productId, productName, oldPrice, newPrice, discount },
      isPush: true,
    });
  }

  private async sendPushNotification(pushToken: string, notification: Notification): Promise<void> {
    // TODO: Implémenter l'envoi réel de notification push
    // Exemple avec Firebase Cloud Messaging ou autre service
    console.log(`Envoi notification push à ${pushToken}:`, {
      title: notification.title,
      message: notification.message,
      data: notification.metadata,
    });
  }
}
