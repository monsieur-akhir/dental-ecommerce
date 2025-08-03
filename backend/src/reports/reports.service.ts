import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order, OrderItem, Product, User, OrderStatus } from '../entities';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getSalesReport(period: '7d' | '30d' | '90d' | '1y' = '30d') {
    const { startDate, endDate } = this.getDateRange(period);

    // Total des ventes
    const totalSales = await this.orderRepository
      .createQueryBuilder('order')
      .select('COALESCE(SUM(order.totalAmount), 0)', 'total')
      .where('order.status != :status', { status: OrderStatus.CANCELLED })
      .andWhere('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();

    // Ventes mensuelles
    const monthlySales = await this.orderRepository
      .createQueryBuilder('order')
      .select('DATE_FORMAT(order.createdAt, "%Y-%m")', 'month')
      .addSelect('COALESCE(SUM(order.totalAmount), 0)', 'amount')
      .where('order.status != :status', { status: OrderStatus.CANCELLED })
      .andWhere('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    // Ventes quotidiennes (7 derniers jours)
    const dailySales = await this.orderRepository
      .createQueryBuilder('order')
      .select('DATE(order.createdAt)', 'date')
      .addSelect('COALESCE(SUM(order.totalAmount), 0)', 'amount')
      .where('order.status != :status', { status: OrderStatus.CANCELLED })
      .andWhere('order.createdAt >= :startDate', { startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      total: parseFloat(totalSales.total) || 0,
      monthly: monthlySales.map(item => ({
        month: this.formatMonth(item.month),
        amount: parseFloat(item.amount) || 0
      })),
      daily: dailySales.map(item => ({
        date: item.date,
        amount: parseFloat(item.amount) || 0
      }))
    };
  }

  async getOrdersReport(period: '7d' | '30d' | '90d' | '1y' = '30d') {
    const { startDate, endDate } = this.getDateRange(period);

    // Statistiques générales
    const totalOrders = await this.orderRepository.count({
      where: { createdAt: Between(startDate, endDate) }
    });

    const pendingOrders = await this.orderRepository.count({
      where: { status: OrderStatus.PENDING, createdAt: Between(startDate, endDate) }
    });

    const completedOrders = await this.orderRepository.count({
      where: { status: OrderStatus.DELIVERED, createdAt: Between(startDate, endDate) }
    });

    const cancelledOrders = await this.orderRepository.count({
      where: { status: OrderStatus.CANCELLED, createdAt: Between(startDate, endDate) }
    });

    // Commandes mensuelles
    const monthlyOrders = await this.orderRepository
      .createQueryBuilder('order')
      .select('DATE_FORMAT(order.createdAt, "%Y-%m")', 'month')
      .addSelect('COUNT(*)', 'count')
      .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    return {
      total: totalOrders,
      pending: pendingOrders,
      completed: completedOrders,
      cancelled: cancelledOrders,
      monthly: monthlyOrders.map(item => ({
        month: this.formatMonth(item.month),
        count: parseInt(item.count) || 0
      }))
    };
  }

  async getProductsReport() {
    // Statistiques des produits
    const totalProducts = await this.productRepository.count();
    const activeProducts = await this.productRepository.count({ where: { isActive: true } });
    const lowStockProducts = await this.productRepository.count({ where: { stockQuantity: Between(1, 10) } });

    // Produits les plus vendus
    const topSellingProducts = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .leftJoin('orderItem.product', 'product')
      .leftJoin('orderItem.order', 'order')
      .select('product.id', 'id')
      .addSelect('product.name', 'name')
      .addSelect('COALESCE(SUM(orderItem.quantity), 0)', 'sales')
      .where('order.status != :status', { status: OrderStatus.CANCELLED })
      .groupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('sales', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      total: totalProducts,
      active: activeProducts,
      lowStock: lowStockProducts,
      topSelling: topSellingProducts.map(item => ({
        id: item.id,
        name: item.name,
        sales: parseInt(item.sales) || 0
      }))
    };
  }

  async getUsersReport(period: '7d' | '30d' | '90d' | '1y' = '30d') {
    const { startDate, endDate } = this.getDateRange(period);

    // Statistiques des utilisateurs
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({ where: { isActive: true } });
    const newThisMonth = await this.userRepository.count({
      where: { createdAt: Between(startDate, endDate) }
    });

    // Utilisateurs mensuels
    const monthlyUsers = await this.userRepository
      .createQueryBuilder('user')
      .select('DATE_FORMAT(user.createdAt, "%Y-%m")', 'month')
      .addSelect('COUNT(*)', 'count')
      .where('user.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    return {
      total: totalUsers,
      active: activeUsers,
      newThisMonth,
      monthly: monthlyUsers.map(item => ({
        month: this.formatMonth(item.month),
        count: parseInt(item.count) || 0
      }))
    };
  }

  async getCompleteReport(period: '7d' | '30d' | '90d' | '1y' = '30d') {
    try {
      const [sales, orders, products, users] = await Promise.all([
        this.getSalesReport(period),
        this.getOrdersReport(period),
        this.getProductsReport(),
        this.getUsersReport(period)
      ]);

      return {
        sales,
        orders,
        products,
        users
      };
    } catch (error) {
      console.error('Erreur lors de la génération du rapport complet:', error);
      throw error;
    }
  }

  private getDateRange(period: '7d' | '30d' | '90d' | '1y') {
    const endDate = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate };
  }

  private formatMonth(monthString: string): string {
    const months = {
      '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr',
      '05': 'Mai', '06': 'Juin', '07': 'Juil', '08': 'Août',
      '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc'
    };
    
    const month = monthString.split('-')[1];
    return months[month] || month;
  }
} 