import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product, Category } from '../entities';
import { CreateProductDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { categoryIds, ...productData } = createProductDto;

    const product = this.productRepository.create(productData);

    if (categoryIds && categoryIds.length > 0) {
      const categories = await this.categoryRepository.findBy({
        id: In(categoryIds),
      });
      product.categories = categories;
    }

    return this.productRepository.save(product);
  }

  async findAll(options?: {
    categoryId?: number;
    search?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[]; total: number }> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'category')
      .leftJoinAndSelect('product.images', 'image')
      .orderBy('product.createdAt', 'DESC');

    if (options?.categoryId) {
      queryBuilder.andWhere('category.id = :categoryId', {
        categoryId: options.categoryId,
      });
    }

    if (options?.search) {
      queryBuilder.andWhere(
        '(product.name LIKE :search OR product.description LIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    if (options?.isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', {
        isActive: options.isActive,
      });
    }

    if (options?.isFeatured !== undefined) {
      queryBuilder.andWhere('product.isFeatured = :isFeatured', {
        isFeatured: options.isFeatured,
      });
    }

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    const [products, total] = await queryBuilder.getManyAndCount();

    return { products, total };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['categories', 'images'],
    });

    if (!product) {
      throw new NotFoundException(`Produit avec l'ID ${id} non trouvé`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const { categoryIds, ...productData } = updateProductDto;

    const product = await this.findOne(id);

    if (categoryIds !== undefined) {
      if (categoryIds.length > 0) {
        const categories = await this.categoryRepository.findBy({
          id: In(categoryIds),
        });
        product.categories = categories;
      } else {
        product.categories = [];
      }
    }

    Object.assign(product, productData);

    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async findLowStock(threshold: number = 10): Promise<Product[]> {
    return this.productRepository.find({
      where: {
        stockQuantity: threshold,
        isActive: true,
      },
      relations: ['categories', 'images'],
      order: { stockQuantity: 'ASC' },
    });
  }

  async findBestSellers(limit: number = 10): Promise<Product[]> {
    return this.productRepository.find({
      where: { isActive: true },
      relations: ['categories', 'images'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
