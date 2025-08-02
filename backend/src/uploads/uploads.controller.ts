import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '../entities';

@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @Roles(RoleType.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('productId') productId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const parsedProductId = productId ? parseInt(productId) : undefined;
    return this.uploadsService.uploadImage(file, parsedProductId);
  }

  @Post('images')
  @Roles(RoleType.ADMIN)
  @UseInterceptors(FilesInterceptor('files', 10)) // Maximum 10 fichiers
  async uploadMultipleImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('productId') productId?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const parsedProductId = productId ? parseInt(productId) : undefined;
    return this.uploadsService.uploadMultipleImages(files, parsedProductId);
  }

  @Get()
  @Roles(RoleType.ADMIN)
  findAll() {
    return this.uploadsService.findAll();
  }

  @Get(':id')
  @Roles(RoleType.ADMIN)
  findOne(@Param('id') id: string) {
    return this.uploadsService.findOne(+id);
  }

  @Get('product/:productId')
  @Roles(RoleType.ADMIN)
  findByProduct(@Param('productId') productId: string) {
    return this.uploadsService.findByProduct(+productId);
  }

  @Delete(':id')
  @Roles(RoleType.ADMIN)
  remove(@Param('id') id: string) {
    return this.uploadsService.remove(+id);
  }

  @Post(':id/product/:productId')
  @Roles(RoleType.ADMIN)
  updateProductId(
    @Param('id') id: string,
    @Param('productId') productId: string,
  ) {
    return this.uploadsService.updateProductId(+id, +productId);
  }
}

