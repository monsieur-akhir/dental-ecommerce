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
    const { categoryIds, categoryNames, ...productData } = createProductDto;

    const product = this.productRepository.create(productData);

    // Gestion des catégories
    if (categoryIds && categoryIds.length > 0) {
      const categories = await this.categoryRepository.findBy({
        id: In(categoryIds),
      });
      product.categories = categories;
    }

    // Création automatique de nouvelles catégories si fournies
    if (categoryNames && categoryNames.length > 0) {
      const existingCategories = product.categories || [];
      const newCategories: Category[] = [];

      for (const categoryName of categoryNames) {
        let category = await this.categoryRepository.findOne({
          where: { name: categoryName }
        });

        if (!category) {
          // Créer automatiquement la catégorie
          category = this.categoryRepository.create({
            name: categoryName,
            description: `Catégorie créée automatiquement pour ${categoryName}`,
            isActive: true,
            slug: categoryName.toLowerCase().replace(/\s+/g, '-')
          });
          category = await this.categoryRepository.save(category);
        }

        newCategories.push(category);
      }

      product.categories = [...existingCategories, ...newCategories];
    }

    // Le SKU sera généré automatiquement par l'entité si non fourni
    return this.productRepository.save(product);
  }

  async findAll(options?: {
    categoryId?: number;
    categoryIds?: number[];
    search?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    page?: number;
    limit?: number;
    color?: string;
    size?: string;
    brand?: string;
    excludeId?: number;
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

    if (options?.categoryIds && options.categoryIds.length > 0) {
      queryBuilder.andWhere('category.id IN (:...categoryIds)', {
        categoryIds: options.categoryIds,
      });
    }

    if (options?.search) {
      queryBuilder.andWhere(
        '(product.name LIKE :search OR product.description LIKE :search OR product.sku LIKE :search)',
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

    if (options?.brand) {
      queryBuilder.andWhere('product.brand = :brand', {
        brand: options.brand,
      });
    }

    if (options?.excludeId) {
      queryBuilder.andWhere('product.id != :excludeId', {
        excludeId: options.excludeId,
      });
    }

    // Filtres pour les variantes
    if (options?.color) {
      queryBuilder.andWhere('product.color = :color OR product.colors LIKE :colorLike', {
        color: options.color,
        colorLike: `%${options.color}%`
      });
    }

    if (options?.size) {
      queryBuilder.andWhere('product.size = :size OR product.sizes LIKE :sizeLike', {
        size: options.size,
        sizeLike: `%${options.size}%`
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
    const { categoryIds, categoryNames, ...productData } = updateProductDto;

    const product = await this.findOne(id);

    // Mise à jour des propriétés du produit
    Object.assign(product, productData);

    // Gestion des catégories
    if (categoryIds && categoryIds.length > 0) {
      const categories = await this.categoryRepository.findBy({
        id: In(categoryIds),
      });
      product.categories = categories;
    }

    // Création automatique de nouvelles catégories si fournies
    if (categoryNames && categoryNames.length > 0) {
      const existingCategories = product.categories || [];
      const newCategories: Category[] = [];

      for (const categoryName of categoryNames) {
        let category = await this.categoryRepository.findOne({
          where: { name: categoryName }
        });

        if (!category) {
          // Créer automatiquement la catégorie
          category = this.categoryRepository.create({
            name: categoryName,
            description: `Catégorie créée automatiquement pour ${categoryName}`,
            isActive: true,
            slug: categoryName.toLowerCase().replace(/\s+/g, '-')
          });
          category = await this.categoryRepository.save(category);
        }

        newCategories.push(category);
      }

      product.categories = [...existingCategories, ...newCategories];
    }

    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async findLowStock(threshold: number = 10): Promise<Product[]> {
    return this.productRepository.find({
      where: { stockQuantity: threshold },
      relations: ['categories'],
    });
  }

  async findBestSellers(limit: number = 10): Promise<Product[]> {
    return this.productRepository.find({
      order: { salesCount: 'DESC' },
      take: limit,
      relations: ['categories', 'images'],
    });
  }

  async uploadImages(
    productId: number,
    files: Express.Multer.File[],
    body: { sortOrder?: string; isPrimary?: string },
  ): Promise<Image[]> {
    const product = await this.findOne(productId);
    const images: Image[] = [];

    for (const file of files) {
      const image = this.imageRepository.create({
        filename: file.filename,
        originalName: file.originalname,
        url: `/uploads/${file.filename}`,
        mimeType: file.mimetype,
        size: file.size,
        altText: file.originalname,
        sortOrder: body.sortOrder ? parseInt(body.sortOrder) : 0,
        isPrimary: body.isPrimary === 'true',
        product: product,
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

  // Méthodes utilitaires pour les variantes
  async getAvailableColors(): Promise<string[]> {
    const products = await this.productRepository.find({
      select: ['colors', 'color'],
      where: { isActive: true }
    });

    const colors = new Set<string>();
    products.forEach(product => {
      if (product.colors) {
        product.colors.forEach(color => colors.add(color));
      }
      if (product.color) {
        colors.add(product.color);
      }
    });

    return Array.from(colors).sort();
  }

  async getAvailableSizes(): Promise<string[]> {
    const products = await this.productRepository.find({
      select: ['sizes', 'size'],
      where: { isActive: true }
    });

    const sizes = new Set<string>();
    products.forEach(product => {
      if (product.sizes) {
        product.sizes.forEach(size => sizes.add(size));
      }
      if (product.size) {
        sizes.add(product.size);
      }
    });

    return Array.from(sizes).sort();
  }
}
