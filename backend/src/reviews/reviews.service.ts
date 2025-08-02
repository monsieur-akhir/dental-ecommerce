import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewStatus } from '../entities/review.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  // Créer un nouvel avis
  async create(userId: number, productId: number, createReviewDto: CreateReviewDto): Promise<Review> {
    // Vérifier que l'utilisateur existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier que le produit existe
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }

    // Vérifier que l'utilisateur n'a pas déjà laissé un avis pour ce produit
    const existingReview = await this.reviewRepository.findOne({
      where: { userId, productId }
    });

    if (existingReview) {
      throw new BadRequestException('Vous avez déjà laissé un avis pour ce produit');
    }

    // Vérifier que la note est valide
    if (createReviewDto.rating < 1 || createReviewDto.rating > 5) {
      throw new BadRequestException('La note doit être comprise entre 1 et 5');
    }

    // Créer l'avis
    const review = this.reviewRepository.create({
      ...createReviewDto,
      userId,
      productId,
      status: ReviewStatus.PENDING // Par défaut en attente d'approbation
    });

    const savedReview = await this.reviewRepository.save(review);

    // Mettre à jour les statistiques du produit
    await this.updateProductRatingStats(productId);

    return savedReview;
  }

  // Obtenir tous les avis d'un produit
  async getProductReviews(
    productId: number,
    status: ReviewStatus = ReviewStatus.APPROVED,
    page: number = 1,
    limit: number = 10
  ): Promise<{ reviews: Review[]; total: number; averageRating: number; totalReviews: number }> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }

    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.productId = :productId', { productId })
      .andWhere('review.status = :status', { status })
      .orderBy('review.createdAt', 'DESC');

    const total = await queryBuilder.getCount();
    const reviews = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    // Calculer la note moyenne
    const averageRating = await this.getAverageRating(productId, status);
    const totalReviews = await this.getTotalReviews(productId, status);

    return {
      reviews,
      total,
      averageRating,
      totalReviews
    };
  }

  // Obtenir les avis d'un utilisateur
  async getUserReviews(userId: number, page: number = 1, limit: number = 10): Promise<{ reviews: Review[]; total: number }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.product', 'product')
      .where('review.userId = :userId', { userId })
      .orderBy('review.createdAt', 'DESC');

    const total = await queryBuilder.getCount();
    const reviews = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { reviews, total };
  }

  // Mettre à jour un avis
  async update(userId: number, reviewId: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['product']
    });

    if (!review) {
      throw new NotFoundException('Avis non trouvé');
    }

    // Vérifier que l'utilisateur est propriétaire de l'avis ou admin
    if (review.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez pas modifier cet avis');
    }

    // Vérifier que la note est valide
    if (updateReviewDto.rating && (updateReviewDto.rating < 1 || updateReviewDto.rating > 5)) {
      throw new BadRequestException('La note doit être comprise entre 1 et 5');
    }

    // Mettre à jour l'avis
    Object.assign(review, updateReviewDto);
    review.status = ReviewStatus.PENDING; // Remettre en attente d'approbation

    const updatedReview = await this.reviewRepository.save(review);

    // Mettre à jour les statistiques du produit
    await this.updateProductRatingStats(review.productId);

    return updatedReview;
  }

  // Supprimer un avis
  async delete(userId: number, reviewId: number): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId }
    });

    if (!review) {
      throw new NotFoundException('Avis non trouvé');
    }

    // Vérifier que l'utilisateur est propriétaire de l'avis ou admin
    if (review.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez pas supprimer cet avis');
    }

    const productId = review.productId;
    await this.reviewRepository.remove(review);

    // Mettre à jour les statistiques du produit
    await this.updateProductRatingStats(productId);
  }

  // Approuver un avis (admin seulement)
  async approve(reviewId: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId }
    });

    if (!review) {
      throw new NotFoundException('Avis non trouvé');
    }

    review.status = ReviewStatus.APPROVED;
    const approvedReview = await this.reviewRepository.save(review);

    // Mettre à jour les statistiques du produit
    await this.updateProductRatingStats(review.productId);

    return approvedReview;
  }

  // Rejeter un avis (admin seulement)
  async reject(reviewId: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId }
    });

    if (!review) {
      throw new NotFoundException('Avis non trouvé');
    }

    review.status = ReviewStatus.REJECTED;
    const rejectedReview = await this.reviewRepository.save(review);

    // Mettre à jour les statistiques du produit
    await this.updateProductRatingStats(review.productId);

    return rejectedReview;
  }

  // Marquer un avis comme utile
  async markAsHelpful(reviewId: number, userId: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId }
    });

    if (!review) {
      throw new NotFoundException('Avis non trouvé');
    }

    review.helpfulCount += 1;
    return this.reviewRepository.save(review);
  }

  // Marquer un avis comme non utile
  async markAsNotHelpful(reviewId: number, userId: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId }
    });

    if (!review) {
      throw new NotFoundException('Avis non trouvé');
    }

    review.notHelpfulCount += 1;
    return this.reviewRepository.save(review);
  }

  // Obtenir la note moyenne d'un produit
  async getAverageRating(productId: number, status: ReviewStatus = ReviewStatus.APPROVED): Promise<number> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .where('review.productId = :productId', { productId })
      .andWhere('review.status = :status', { status })
      .getRawOne();

    return result?.average ? parseFloat(result.average) : 0;
  }

  // Obtenir le nombre total d'avis d'un produit
  async getTotalReviews(productId: number, status: ReviewStatus = ReviewStatus.APPROVED): Promise<number> {
    return this.reviewRepository.count({
      where: { productId, status }
    });
  }

  // Obtenir les statistiques d'avis d'un produit
  async getProductReviewStats(productId: number): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  }> {
    const averageRating = await this.getAverageRating(productId);
    const totalReviews = await this.getTotalReviews(productId);

    // Distribution des notes
    const ratingDistribution = {};
    for (let i = 1; i <= 5; i++) {
      const count = await this.reviewRepository.count({
        where: { productId, rating: i, status: ReviewStatus.APPROVED }
      });
      ratingDistribution[i] = count;
    }

    return {
      averageRating,
      totalReviews,
      ratingDistribution
    };
  }

  // Mettre à jour les statistiques de note d'un produit
  private async updateProductRatingStats(productId: number): Promise<void> {
    // Cette méthode pourrait être utilisée pour mettre à jour des champs calculés
    // dans l'entité Product si nécessaire
    // Pour l'instant, les statistiques sont calculées à la volée
  }

  // Obtenir les avis en attente d'approbation (admin seulement)
  async getPendingReviews(page: number = 1, limit: number = 20): Promise<{ reviews: Review[]; total: number }> {
    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.product', 'product')
      .where('review.status = :status', { status: ReviewStatus.PENDING })
      .orderBy('review.createdAt', 'ASC');

    const total = await queryBuilder.getCount();
    const reviews = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { reviews, total };
  }
} 