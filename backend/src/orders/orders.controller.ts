import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleType, User, OrderStatus } from '../entities';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: User) {
    return this.ordersService.create(createOrderDto, user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('status') status?: OrderStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const options = {
      userId: userId ? parseInt(userId) : undefined,
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    };

    return this.ordersService.findAll(options);
  }

  @Get('my-orders')
  findMyOrders(@CurrentUser() user: User) {
    return this.ordersService.findByUser(user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @Get('stats')
  async getOrderStats() {
    console.log('📊 Demande de statistiques de commandes...');
    try {
      const stats = await this.ordersService.getOrderStats();
      console.log('✅ Statistiques de commandes récupérées:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques de commandes:', error);
      throw error;
    }
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @Get('stats/test')
  async testOrderStats() {
    console.log('🧪 Test des statistiques de commandes...');
    try {
      // Test des requêtes individuelles
      const totalOrders = await this.ordersService['orderRepository'].count();
      console.log('📦 Total commandes:', totalOrders);
      
      const pendingOrders = await this.ordersService['orderRepository'].count({
        where: { status: OrderStatus.PENDING },
      });
      console.log('⏳ Commandes en attente:', pendingOrders);
      
      const completedOrders = await this.ordersService['orderRepository'].count({
        where: { status: OrderStatus.DELIVERED },
      });
      console.log('✅ Commandes livrées:', completedOrders);
      
      const revenueResult = await this.ordersService['orderRepository']
        .createQueryBuilder('order')
        .select('COALESCE(SUM(order.totalAmount), 0)', 'total')
        .where('order.status != :status', { status: OrderStatus.CANCELLED })
        .getRawOne();
      
      console.log('💰 Résultat revenus:', revenueResult);
      
      return {
        message: 'Test des statistiques terminé',
        totalOrders,
        pendingOrders,
        completedOrders,
        revenueResult,
      };
    } catch (error) {
      console.error('❌ Erreur lors du test des statistiques:', error);
      throw error;
    }
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    // Les clients ne peuvent voir que leurs propres commandes
    if (user.role.name === RoleType.CLIENT) {
      // TODO: Vérifier que la commande appartient à l'utilisateur
    }
    return this.ordersService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(id);
  }
}
