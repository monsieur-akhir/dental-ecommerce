import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comparison, User, Product } from '../entities';
import { AddToComparisonDto } from './dto';

@Injectable()
export class ComparisonService {
  private readonly MAX_COMPARISON_ITEMS = 4; // Limite de produits en comparaison

  constructor(
    @InjectRepository(Comparison)
    private comparisonRepository: Repository<Comparison>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async addToComparison(userId: number, addToComparisonDto: AddToComparisonDto): Promise<Comparison> {
    const { productId } = addToComparisonDto;

    // Vérifier que le produit existe
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Produit avec l'ID ${productId} non trouvé`);
    }

    // Vérifier si le produit n'est pas déjà en comparaison
    const existingComparisonItem = await this.comparisonRepository.findOne({
      where: { userId, productId },
    });

    if (existingComparisonItem) {
      throw new ConflictException('Ce produit est déjà dans votre comparaison');
    }

    // Vérifier la limite de produits en comparaison
    const currentCount = await this.comparisonRepository.count({
      where: { userId },
    });

    if (currentCount >= this.MAX_COMPARISON_ITEMS) {
      throw new BadRequestException(`Vous ne pouvez comparer que ${this.MAX_COMPARISON_ITEMS} produits maximum`);
    }

    // Créer l'entrée comparison
    const comparisonItem = this.comparisonRepository.create({
      userId,
      productId,
    });

    const savedComparisonItem = await this.comparisonRepository.save(comparisonItem);

    // Retourner avec les relations
    const result = await this.comparisonRepository.findOne({
      where: { id: savedComparisonItem.id },
      relations: ['product', 'product.images', 'product.categories'],
    });

    if (!result) {
      throw new NotFoundException('Erreur lors de la sauvegarde de la comparaison');
    }

    return result;
  }

  async removeFromComparison(userId: number, productId: number): Promise<void> {
    const comparisonItem = await this.comparisonRepository.findOne({
      where: { userId, productId },
    });

    if (!comparisonItem) {
      throw new NotFoundException('Ce produit n\'est pas dans votre comparaison');
    }

    await this.comparisonRepository.remove(comparisonItem);
  }

  async getUserComparison(userId: number): Promise<Comparison[]> {
    return this.comparisonRepository.find({
      where: { userId },
      relations: ['product', 'product.images', 'product.categories'],
      order: { createdAt: 'DESC' },
    });
  }

  async isInComparison(userId: number, productId: number): Promise<boolean> {
    const comparisonItem = await this.comparisonRepository.findOne({
      where: { userId, productId },
    });

    return !!comparisonItem;
  }

  async getComparisonCount(userId: number): Promise<number> {
    return this.comparisonRepository.count({
      where: { userId },
    });
  }

  async clearComparison(userId: number): Promise<void> {
    await this.comparisonRepository.delete({ userId });
  }

  async getComparisonDetails(userId: number): Promise<{
    products: any[];
    comparisonMatrix: any;
    summary: any;
  }> {
    const comparisonItems = await this.comparisonRepository.find({
      where: { userId },
      relations: ['product', 'product.categories'],
      order: { createdAt: 'ASC' },
    });

    if (comparisonItems.length === 0) {
      return {
        products: [],
        comparisonMatrix: {},
        summary: {},
      };
    }

    const products = comparisonItems.map(item => item.product);

    // Créer une matrice de comparaison
    const comparisonMatrix = {
      price: {
        min: Math.min(...products.map(p => Number(p.price))),
        max: Math.max(...products.map(p => Number(p.price))),
        average: products.reduce((sum, p) => sum + Number(p.price), 0) / products.length,
      },
      weight: {
        min: Math.min(...products.filter(p => p.weight).map(p => Number(p.weight))),
        max: Math.max(...products.filter(p => p.weight).map(p => Number(p.weight))),
        average: products.filter(p => p.weight).reduce((sum, p) => sum + Number(p.weight), 0) / products.filter(p => p.weight).length,
      },
      brands: [...new Set(products.filter(p => p.brand).map(p => p.brand))],
      categories: [...new Set(products.flatMap(p => p.categories.map(c => c.name)))],
      stockStatus: {
        inStock: products.filter(p => p.stockQuantity > 0).length,
        outOfStock: products.filter(p => p.stockQuantity === 0).length,
      },
    };

    // Résumé de la comparaison
    const summary = {
      totalProducts: products.length,
      priceRange: `${comparisonMatrix.price.min.toFixed(2)} € - ${comparisonMatrix.price.max.toFixed(2)} €`,
      cheapest: products.find(p => Number(p.price) === comparisonMatrix.price.min),
      mostExpensive: products.find(p => Number(p.price) === comparisonMatrix.price.max),
      averagePrice: comparisonMatrix.price.average.toFixed(2),
      uniqueBrands: comparisonMatrix.brands.length,
      uniqueCategories: comparisonMatrix.categories.length,
    };

    return {
      products,
      comparisonMatrix,
      summary,
    };
  }

  async getComparisonRecommendations(userId: number): Promise<Product[]> {
    const comparisonItems = await this.comparisonRepository.find({
      where: { userId },
      relations: ['product', 'product.categories'],
    });

    if (comparisonItems.length === 0) {
      return [];
    }

    // Extraire les catégories des produits en comparaison
    const categoryIds = [...new Set(
      comparisonItems.flatMap(item => 
        item.product.categories.map(category => category.id)
      )
    )];

    // Trouver des produits similaires dans les mêmes catégories
    const recommendations = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'category')
      .leftJoinAndSelect('product.images', 'image')
      .where('category.id IN (:...categoryIds)', { categoryIds })
      .andWhere('product.id NOT IN (:...excludeIds)', { 
        excludeIds: comparisonItems.map(item => item.productId) 
      })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .orderBy('RAND()')
      .limit(6)
      .getMany();

    return recommendations;
  }

  async canAddToComparison(userId: number): Promise<{
    canAdd: boolean;
    currentCount: number;
    maxCount: number;
    remainingSlots: number;
  }> {
    const currentCount = await this.getComparisonCount(userId);
    const canAdd = currentCount < this.MAX_COMPARISON_ITEMS;
    
    return {
      canAdd,
      currentCount,
      maxCount: this.MAX_COMPARISON_ITEMS,
      remainingSlots: this.MAX_COMPARISON_ITEMS - currentCount,
    };
  }

  async findByUserAndProduct(userId: number, productId: number): Promise<Comparison> {
    const comparison = await this.comparisonRepository.findOne({ where: { userId, productId } });
    if (!comparison) {
      throw new NotFoundException('Comparaison non trouvée');
    }
    return comparison;
  }
}
