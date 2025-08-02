import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product, Category, Image } from '../entities';
import { CreateProductDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
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

  async uploadImages(
    productId: number,
    files: Express.Multer.File[],
    body: { sortOrder?: string; isPrimary?: string },
  ): Promise<Image[]> {
    const product = await this.findOne(productId);
    const images: Image[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isPrimary = body.isPrimary === 'true' && i === 0;

      const image = this.imageRepository.create({
        filename: file.filename,
        originalName: file.originalname,
        url: `/uploads/${file.filename}`,
        mimeType: file.mimetype,
        size: file.size,
        sortOrder: parseInt(body.sortOrder || i.toString()),
        isPrimary,
        product,
      });

      const savedImage = await this.imageRepository.save(image);
      images.push(savedImage);
    }

    return images;
  }

  async deleteImage(imageId: number): Promise<void> {
    const image = await this.imageRepository.findOne({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException(`Image avec l'ID ${imageId} non trouvée`);
    }

    await this.imageRepository.remove(image);
  }
}
