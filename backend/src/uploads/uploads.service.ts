import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '../entities';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
  ) {}

  async uploadImage(file: Express.Multer.File, productId?: number): Promise<Image> {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    // Vérifier le type de fichier
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Type de fichier non autorisé. Seuls les formats JPEG, PNG et WebP sont acceptés.');
    }

    // Vérifier la taille du fichier (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('Le fichier est trop volumineux. Taille maximale: 5MB');
    }

    // Générer un nom de fichier unique
    const fileExtension = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;
    
    // Créer le répertoire uploads s'il n'existe pas
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Chemin complet du fichier
    const filePath = path.join(uploadsDir, fileName);

    try {
      // Sauvegarder le fichier
      fs.writeFileSync(filePath, file.buffer);

      // Créer l'enregistrement en base de données
      const image = this.imageRepository.create({
        filename: fileName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/${fileName}`,
        productId,
      });

      const savedImage = await this.imageRepository.save(image);
      return savedImage;
    } catch (error) {
      // Supprimer le fichier en cas d'erreur
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw new BadRequestException('Erreur lors de la sauvegarde du fichier');
    }
  }

  async uploadMultipleImages(files: Express.Multer.File[], productId?: number): Promise<Image[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const uploadedImages: Image[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        const image = await this.uploadImage(file, productId);
        uploadedImages.push(image);
      } catch (error) {
        errors.push(`${file.originalname}: ${error.message}`);
      }
    }

    if (errors.length > 0 && uploadedImages.length === 0) {
      throw new BadRequestException(`Erreurs lors de l'upload: ${errors.join(', ')}`);
    }

    return uploadedImages;
  }

  async findAll(): Promise<Image[]> {
    return this.imageRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Image> {
    const image = await this.imageRepository.findOne({ where: { id } });
    if (!image) {
      throw new NotFoundException(`Image avec l'ID ${id} non trouvée`);
    }
    return image;
  }

  async findByProduct(productId: number): Promise<Image[]> {
    return this.imageRepository.find({
      where: { productId },
      order: { createdAt: 'ASC' },
    });
  }

  async remove(id: number): Promise<void> {
    const image = await this.findOne(id);
    
    // Supprimer le fichier physique
    const filePath = path.join(process.cwd(), 'uploads', image.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Supprimer l'enregistrement en base de données
    await this.imageRepository.remove(image);
  }

  async removeByProduct(productId: number): Promise<void> {
    const images = await this.findByProduct(productId);
    
    for (const image of images) {
      await this.remove(image.id);
    }
  }

  async updateProductId(imageId: number, productId: number): Promise<Image> {
    const image = await this.findOne(imageId);
    image.productId = productId;
    return this.imageRepository.save(image);
  }
}

