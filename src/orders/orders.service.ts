import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderItem, Product, User, OrderStatus } from '../entities';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: number): Promise<Order> {
    const { items, ...orderData } = createOrderDto;

    // Vérifier la disponibilité des produits et calculer les totaux
    let subtotal = 0;
    const orderItems: Partial<OrderItem>[] = [];

    for (const item of items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`Produit avec l'ID ${item.productId} non trouvé`);
      }

      if (!product.isActive) {
        throw new BadRequestException(`Le produit ${product.name} n'est plus disponible`);
      }

      if (product.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Stock insuffisant pour ${product.name}. Stock disponible: ${product.stockQuantity}`,
        );
      }

      const totalPrice = item.unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
      });
    }

    // Générer un numéro de commande unique
    const orderNumber = this.generateOrderNumber();

    // Créer la commande
    const order = this.orderRepository.create({
      ...orderData,
      orderNumber,
      userId,
      subtotal,
      totalAmount: subtotal, // Pour l'instant, pas de taxes ni frais de livraison
      orderItems: orderItems as OrderItem[],
    });

    const savedOrder = await this.orderRepository.save(order);

    // Mettre à jour les stocks
    for (const item of items) {
      await this.productRepository.update(item.productId, {
        stockQuantity: () => `stockQuantity - ${item.quantity}`,
      });
    }

    return this.findOne(savedOrder.id);
  }

  async findAll(options?: {
    userId?: number;
    status?: OrderStatus;
    page?: number;
    limit?: number;
  }): Promise<{ orders: Order[]; total: number }> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.orderItems', 'orderItem')
      .leftJoinAndSelect('orderItem.product', 'product')
      .orderBy('order.createdAt', 'DESC');

    if (options?.userId) {
      queryBuilder.andWhere('order.userId = :userId', { userId: options.userId });
    }

    if (options?.status) {
      queryBuilder.andWhere('order.status = :status', { status: options.status });
    }

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    return { orders, total };
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'orderItems', 'orderItems.product'],
    });

    if (!order) {
      throw new NotFoundException(`Commande avec l'ID ${id} non trouvée`);
    }

    return order;
  }

  async findByUser(userId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: ['orderItems', 'orderItems.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, updateOrderDto);
    await this.orderRepository.save(order);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }

  async getOrderStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
  }> {
    const totalOrders = await this.orderRepository.count();
    const pendingOrders = await this.orderRepository.count({
      where: { status: OrderStatus.PENDING },
    });
    const completedOrders = await this.orderRepository.count({
      where: { status: OrderStatus.DELIVERED },
    });

    const revenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'total')
      .where('order.status != :status', { status: OrderStatus.CANCELLED })
      .getRawOne();

    const totalRevenue = parseFloat(revenueResult.total) || 0;

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
    };
  }
}
