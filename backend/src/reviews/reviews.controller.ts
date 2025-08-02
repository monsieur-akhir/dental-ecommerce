import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '../entities';
import { ReviewStatus } from '../entities/review.entity';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // Créer un nouvel avis
  @Post('products/:productId')
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req,
    @Param('productId') productId: number,
    @Body() createReviewDto: CreateReviewDto
  ) {
    return this.reviewsService.create(req.user.id, productId, createReviewDto);
  }

  // Obtenir les avis d'un produit
  @Get('products/:productId')
  async getProductReviews(
    @Param('productId') productId: number,
    @Query('status') status: ReviewStatus = ReviewStatus.APPROVED,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.reviewsService.getProductReviews(productId, status, page, limit);
  }

  // Obtenir les statistiques d'avis d'un produit
  @Get('products/:productId/stats')
  async getProductReviewStats(@Param('productId') productId: number) {
    return this.reviewsService.getProductReviewStats(productId);
  }

  // Obtenir les avis d'un utilisateur
  @Get('my-reviews')
  @UseGuards(JwtAuthGuard)
  async getMyReviews(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.reviewsService.getUserReviews(req.user.id, page, limit);
  }

  // Mettre à jour un avis
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req,
    @Param('id') id: number,
    @Body() updateReviewDto: UpdateReviewDto
  ) {
    return this.reviewsService.update(req.user.id, id, updateReviewDto);
  }

  // Supprimer un avis
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Request() req, @Param('id') id: number) {
    return this.reviewsService.delete(req.user.id, id);
  }

  // Marquer un avis comme utile
  @Post(':id/helpful')
  @UseGuards(JwtAuthGuard)
  async markAsHelpful(@Request() req, @Param('id') id: number) {
    return this.reviewsService.markAsHelpful(id, req.user.id);
  }

  // Marquer un avis comme non utile
  @Post(':id/not-helpful')
  @UseGuards(JwtAuthGuard)
  async markAsNotHelpful(@Request() req, @Param('id') id: number) {
    return this.reviewsService.markAsNotHelpful(id, req.user.id);
  }

  // === Routes Admin ===

  // Obtenir tous les avis en attente d'approbation
  @Get('admin/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async getPendingReviews(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    return this.reviewsService.getPendingReviews(page, limit);
  }

  // Approuver un avis
  @Post('admin/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async approve(@Param('id') id: number) {
    return this.reviewsService.approve(id);
  }

  // Rejeter un avis
  @Post('admin/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async reject(@Param('id') id: number) {
    return this.reviewsService.reject(id);
  }
} 