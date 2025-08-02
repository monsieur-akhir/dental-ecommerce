import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist, User, Product } from '../entities';
import { AddToWishlistDto } from './dto';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async addToWishlist(userId: number, addToWishlistDto: AddToWishlistDto): Promise<Wishlist> {
    const { productId } = addToWishlistDto;

    // Vérifier que le produit existe
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Produit avec l'ID ${productId} non trouvé`);
    }

    // Vérifier si le produit n'est pas déjà dans la wishlist
    const existingWishlistItem = await this.wishlistRepository.findOne({
      where: { userId, productId },
    });

    if (existingWishlistItem) {
      throw new ConflictException('Ce produit est déjà dans votre liste de souhaits');
    }

    // Créer l'entrée wishlist
    const wishlistItem = this.wishlistRepository.create({
      userId,
      productId,
    });

    const savedWishlistItem = await this.wishlistRepository.save(wishlistItem);

    // Retourner avec les relations
    const result = await this.wishlistRepository.findOne({
      where: { id: savedWishlistItem.id },
      relations: ['product', 'product.images', 'product.categories'],
    });

    if (!result) {
      throw new NotFoundException('Erreur lors de la sauvegarde de la wishlist');
    }

    return result;
  }

  async removeFromWishlist(userId: number, productId: number): Promise<void> {
    const wishlistItem = await this.wishlistRepository.findOne({
      where: { userId, productId },
    });

    if (!wishlistItem) {
      throw new NotFoundException('Ce produit n\'est pas dans votre liste de souhaits');
    }

    await this.wishlistRepository.remove(wishlistItem);
  }

  async getUserWishlist(userId: number): Promise<Wishlist[]> {
    return this.wishlistRepository.find({
      where: { userId },
      relations: ['product', 'product.images', 'product.categories'],
      order: { createdAt: 'DESC' },
    });
  }

  async isInWishlist(userId: number, productId: number): Promise<boolean> {
    const wishlistItem = await this.wishlistRepository.findOne({
      where: { userId, productId },
    });

    return !!wishlistItem;
  }

  async getWishlistCount(userId: number): Promise<number> {
    return this.wishlistRepository.count({
      where: { userId },
    });
  }

  async clearWishlist(userId: number): Promise<void> {
    await this.wishlistRepository.delete({ userId });
  }

  async moveToCart(userId: number, productId: number): Promise<void> {
    // Cette méthode sera implémentée quand le service de panier sera disponible
    // Pour l'instant, on supprime juste de la wishlist
    await this.removeFromWishlist(userId, productId);
  }

  async getWishlistStats(userId: number): Promise<{
    totalItems: number;
    totalValue: number;
    categories: { [key: string]: number };
  }> {
    const wishlistItems = await this.wishlistRepository.find({
      where: { userId },
      relations: ['product', 'product.categories'],
    });

    const totalItems = wishlistItems.length;
    const totalValue = wishlistItems.reduce((sum, item) => sum + Number(item.product.price), 0);
    
    const categories: { [key: string]: number } = {};
    wishlistItems.forEach(item => {
      item.product.categories.forEach(category => {
        categories[category.name] = (categories[category.name] || 0) + 1;
      });
    });

    return {
      totalItems,
      totalValue,
      categories,
    };
  }

  async findByUserAndProduct(userId: number, productId: number): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findOne({ where: { userId, productId } });
    if (!wishlist) {
      throw new NotFoundException('Wishlist non trouvée');
    }
    return wishlist;
  }
}
