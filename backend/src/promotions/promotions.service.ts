import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { Promotion, PromotionType, PromotionStatus } from '../entities/promotion.entity';
import { PromoCode } from '../entities/promo-code.entity';
import { UserPromotion } from '../entities/user-promotion.entity';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { User } from '../entities/user.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { ApplyPromoCodeDto } from './dto/apply-promo-code.dto';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,
    @InjectRepository(PromoCode)
    private promoCodeRepository: Repository<PromoCode>,
    @InjectRepository(UserPromotion)
    private userPromotionRepository: Repository<UserPromotion>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createPromotion(createPromotionDto: CreatePromotionDto): Promise<Promotion> {
    const { productIds, categoryIds, ...promotionData } = createPromotionDto;

    // Validation des dates
    if (promotionData.startDate >= promotionData.endDate) {
      throw new BadRequestException('La date de fin doit être postérieure à la date de début');
    }

    // Créer la promotion
    const promotion = this.promotionRepository.create({
      ...promotionData,
      status: promotionData.status || PromotionStatus.DRAFT,
      usageLimit: promotionData.usageLimit || 0,
      usageLimitPerUser: promotionData.usageLimitPerUser || 1,
      isStackable: promotionData.isStackable || false,
      applyToSale: promotionData.applyToSale || false,
    });

    const savedPromotion = await this.promotionRepository.save(promotion);

    // Associer les produits si spécifiés
    if (productIds && productIds.length > 0) {
      const products = await this.productRepository.findBy({ id: In(productIds) });
      savedPromotion.products = products;
    }

    // Associer les catégories si spécifiées
    if (categoryIds && categoryIds.length > 0) {
      const categories = await this.categoryRepository.findBy({ id: In(categoryIds) });
      savedPromotion.categories = categories;
    }

    return this.promotionRepository.save(savedPromotion);
  }

  async generatePromoCode(
    promotionId: number,
    code: string,
    options: {
      expiresAt?: Date;
      usageLimit?: number;
      usageLimitPerUser?: number;
    } = {},
  ): Promise<PromoCode> {
    const promotion = await this.promotionRepository.findOne({
      where: { id: promotionId },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion non trouvée');
    }

    // Vérifier que le code n'existe pas déjà
    const existingCode = await this.promoCodeRepository.findOne({
      where: { code },
    });

    if (existingCode) {
      throw new BadRequestException('Ce code promo existe déjà');
    }

    const promoCode = this.promoCodeRepository.create({
      code: code.toUpperCase(),
      promotionId,
      expiresAt: options.expiresAt,
      usageLimit: options.usageLimit || 0,
      usageLimitPerUser: options.usageLimitPerUser || 1,
    });

    return this.promoCodeRepository.save(promoCode);
  }

  async applyPromoCode(
    userId: number,
    applyPromoCodeDto: ApplyPromoCodeDto,
  ): Promise<{
    isValid: boolean;
    discount: number;
    promotion?: Promotion;
    promoCode?: PromoCode;
    message?: string;
  }> {
    const { code, cartTotal, cartItems } = applyPromoCodeDto;

    // Trouver le code promo
    const promoCode = await this.promoCodeRepository.findOne({
      where: { code: code.toUpperCase(), isActive: true },
      relations: ['promotion', 'promotion.products', 'promotion.categories'],
    });

    if (!promoCode) {
      return { isValid: false, discount: 0, message: 'Code promo invalide' };
    }

    const promotion = promoCode.promotion;

    // Vérifications de validité
    const validationResult = await this.validatePromotion(userId, promotion, promoCode, cartTotal, cartItems);
    if (!validationResult.isValid) {
      return validationResult;
    }

    // Calculer la réduction
    const discount = this.calculateDiscount(promotion, cartTotal, cartItems);

    return {
      isValid: true,
      discount,
      promotion,
      promoCode,
      message: `Code promo appliqué ! Réduction de ${discount}€`,
    };
  }

  private async validatePromotion(
    userId: number,
    promotion: Promotion,
    promoCode: PromoCode,
    cartTotal: number,
    cartItems: any[],
  ): Promise<{ isValid: boolean; discount: number; message?: string }> {
    const now = new Date();

    // Vérifier les dates de validité de la promotion
    if (now < promotion.startDate || now > promotion.endDate) {
      return { isValid: false, discount: 0, message: 'Cette promotion n\'est plus valide' };
    }

    // Vérifier le statut de la promotion
    if (promotion.status !== PromotionStatus.ACTIVE) {
      return { isValid: false, discount: 0, message: 'Cette promotion n\'est pas active' };
    }

    // Vérifier l'expiration du code promo
    if (promoCode.expiresAt && now > promoCode.expiresAt) {
      return { isValid: false, discount: 0, message: 'Ce code promo a expiré' };
    }

    // Vérifier les limites d'usage du code promo
    if (promoCode.usageLimit > 0 && promoCode.usageCount >= promoCode.usageLimit) {
      return { isValid: false, discount: 0, message: 'Ce code promo a atteint sa limite d\'utilisation' };
    }

    // Vérifier les limites d'usage de la promotion
    if (promotion.usageLimit > 0 && promotion.usageCount >= promotion.usageLimit) {
      return { isValid: false, discount: 0, message: 'Cette promotion a atteint sa limite d\'utilisation' };
    }

    // Vérifier l'usage par utilisateur
    const userUsageCount = await this.userPromotionRepository.count({
      where: { userId, promotionId: promotion.id },
    });

    if (userUsageCount >= promotion.usageLimitPerUser) {
      return { isValid: false, discount: 0, message: 'Vous avez déjà utilisé cette promotion le nombre maximum de fois' };
    }

    const promoCodeUserUsageCount = await this.userPromotionRepository.count({
      where: { userId, promoCodeId: promoCode.id },
    });

    if (promoCodeUserUsageCount >= promoCode.usageLimitPerUser) {
      return { isValid: false, discount: 0, message: 'Vous avez déjà utilisé ce code promo le nombre maximum de fois' };
    }

    // Vérifier le montant minimum de commande
    if (promotion.minimumOrderAmount && cartTotal < promotion.minimumOrderAmount) {
      return {
        isValid: false,
        discount: 0,
        message: `Montant minimum de commande requis: ${promotion.minimumOrderAmount}€`,
      };
    }

    // Vérifier si la promotion s'applique aux produits du panier
    if (promotion.products && promotion.products.length > 0) {
      const promotionProductIds = promotion.products.map(p => p.id);
      const hasValidProducts = cartItems.some(item => promotionProductIds.includes(item.productId));
      
      if (!hasValidProducts) {
        return { isValid: false, discount: 0, message: 'Cette promotion ne s\'applique à aucun produit de votre panier' };
      }
    }

    // Vérifier si la promotion s'applique aux catégories du panier
    if (promotion.categories && promotion.categories.length > 0) {
      const promotionCategoryIds = promotion.categories.map(c => c.id);
      const hasValidCategories = cartItems.some(item => 
        item.categoryIds && item.categoryIds.some(catId => promotionCategoryIds.includes(catId))
      );
      
      if (!hasValidCategories) {
        return { isValid: false, discount: 0, message: 'Cette promotion ne s\'applique à aucune catégorie de votre panier' };
      }
    }

    return { isValid: true, discount: 0 };
  }

  private calculateDiscount(promotion: Promotion, cartTotal: number, cartItems: any[]): number {
    let discount = 0;

    switch (promotion.type) {
      case PromotionType.PERCENTAGE:
        discount = (cartTotal * promotion.discountValue) / 100;
        if (promotion.maximumDiscountAmount && discount > promotion.maximumDiscountAmount) {
          discount = promotion.maximumDiscountAmount;
        }
        break;

      case PromotionType.FIXED_AMOUNT:
        discount = Math.min(promotion.discountValue, cartTotal);
        break;

      case PromotionType.FREE_SHIPPING:
        // La logique de livraison gratuite sera gérée côté commande
        discount = 0; // Ou le coût de livraison si disponible
        break;

      case PromotionType.BUY_X_GET_Y:
        discount = this.calculateBuyXGetYDiscount(promotion, cartItems);
        break;

      default:
        discount = 0;
    }

    return Math.round(discount * 100) / 100; // Arrondir à 2 décimales
  }

  private calculateBuyXGetYDiscount(promotion: Promotion, cartItems: any[]): number {
    let discount = 0;
    const { buyQuantity, getQuantity } = promotion;

    // Filtrer les articles éligibles
    let eligibleItems = cartItems;
    if (promotion.products && promotion.products.length > 0) {
      const promotionProductIds = promotion.products.map(p => p.id);
      eligibleItems = cartItems.filter(item => promotionProductIds.includes(item.productId));
    }

    // Calculer le nombre d'offres applicables
    const totalEligibleQuantity = eligibleItems.reduce((sum, item) => sum + item.quantity, 0);
    const applicableOffers = Math.floor(totalEligibleQuantity / buyQuantity);

    if (applicableOffers > 0) {
      // Trier les articles par prix croissant pour offrir les moins chers
      const sortedItems = eligibleItems.sort((a, b) => a.price - b.price);
      let freeItemsToGive = applicableOffers * getQuantity;

      for (const item of sortedItems) {
        if (freeItemsToGive <= 0) break;
        
        const freeQuantity = Math.min(freeItemsToGive, item.quantity);
        discount += freeQuantity * item.price;
        freeItemsToGive -= freeQuantity;
      }
    }

    return discount;
  }

  async recordPromotionUsage(
    userId: number,
    promotionId: number,
    promoCodeId: number,
    orderId: number,
    discountAmount: number,
  ): Promise<UserPromotion> {
    // Incrémenter les compteurs d'usage
    await this.promotionRepository.increment({ id: promotionId }, 'usageCount', 1);
    await this.promoCodeRepository.increment({ id: promoCodeId }, 'usageCount', 1);

    // Enregistrer l'usage
    const userPromotion = this.userPromotionRepository.create({
      userId,
      promotionId,
      promoCodeId,
      orderId,
      discountAmount,
    });

    return this.userPromotionRepository.save(userPromotion);
  }

  async getActivePromotions(): Promise<Promotion[]> {
    const now = new Date();
    return this.promotionRepository.find({
      where: {
        status: PromotionStatus.ACTIVE,
        startDate: Between(new Date(0), now),
        endDate: Between(now, new Date('2099-12-31')),
      },
      relations: ['products', 'categories', 'promoCodes'],
    });
  }

  async getPromotionStats(promotionId: number): Promise<{
    totalUsage: number;
    totalDiscount: number;
    uniqueUsers: number;
    averageDiscount: number;
  }> {
    const stats = await this.userPromotionRepository
      .createQueryBuilder('up')
      .select('COUNT(*)', 'totalUsage')
      .addSelect('SUM(up.discountAmount)', 'totalDiscount')
      .addSelect('COUNT(DISTINCT up.userId)', 'uniqueUsers')
      .addSelect('AVG(up.discountAmount)', 'averageDiscount')
      .where('up.promotionId = :promotionId', { promotionId })
      .getRawOne();

    return {
      totalUsage: parseInt(stats.totalUsage) || 0,
      totalDiscount: parseFloat(stats.totalDiscount) || 0,
      uniqueUsers: parseInt(stats.uniqueUsers) || 0,
      averageDiscount: parseFloat(stats.averageDiscount) || 0,
    };
  }

  async getAllPromotions(
    page: number = 1,
    limit: number = 20,
    status?: PromotionStatus,
  ): Promise<{
    promotions: Promotion[];
    total: number;
  }> {
    const queryBuilder = this.promotionRepository
      .createQueryBuilder('promotion')
      .leftJoinAndSelect('promotion.products', 'products')
      .leftJoinAndSelect('promotion.categories', 'categories')
      .leftJoinAndSelect('promotion.promoCodes', 'promoCodes')
      .orderBy('promotion.createdAt', 'DESC');

    if (status) {
      queryBuilder.where('promotion.status = :status', { status });
    }

    const [promotions, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { promotions, total };
  }

  async updatePromotionStatus(promotionId: number, status: PromotionStatus): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { id: promotionId },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion non trouvée');
    }

    promotion.status = status;
    return this.promotionRepository.save(promotion);
  }

  async deletePromotion(promotionId: number): Promise<void> {
    const result = await this.promotionRepository.delete(promotionId);
    if (result.affected === 0) {
      throw new NotFoundException('Promotion non trouvée');
    }
  }
}
