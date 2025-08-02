import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ComparisonService } from './comparison.service';
import { AddToComparisonDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../entities';

@ApiTags('comparison')
@Controller('comparison')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ComparisonController {
  constructor(private readonly comparisonService: ComparisonService) {}

  @Post()
  @ApiOperation({
    summary: 'Ajouter un produit à la comparaison',
    description: 'Ajoute un produit à la liste de comparaison de l\'utilisateur connecté (maximum 4 produits)'
  })
  @ApiBody({ type: AddToComparisonDto })
  @ApiResponse({
    status: 201,
    description: 'Produit ajouté à la comparaison avec succès',
    schema: {
      example: {
        id: 1,
        userId: 1,
        productId: 5,
        createdAt: '2024-01-15T10:30:00Z',
        product: {
          id: 5,
          name: 'Fraise diamantée',
          price: 45.99,
          images: []
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Limite de comparaison atteinte (4 produits maximum)' })
  @ApiResponse({ status: 404, description: 'Produit non trouvé' })
  @ApiResponse({ status: 409, description: 'Produit déjà dans la comparaison' })
  async addToComparison(
    @CurrentUser() user: User,
    @Body() addToComparisonDto: AddToComparisonDto,
  ) {
    return this.comparisonService.addToComparison(user.id, addToComparisonDto);
  }

  @Delete(':productId')
  @ApiOperation({
    summary: 'Retirer un produit de la comparaison',
    description: 'Retire un produit de la liste de comparaison de l\'utilisateur connecté'
  })
  @ApiParam({
    name: 'productId',
    description: 'ID du produit à retirer',
    example: 5
  })
  @ApiResponse({
    status: 200,
    description: 'Produit retiré de la comparaison avec succès'
  })
  @ApiResponse({ status: 404, description: 'Produit non trouvé dans la comparaison' })
  async removeFromComparison(
    @CurrentUser() user: User,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    await this.comparisonService.removeFromComparison(user.id, productId);
    return { message: 'Produit retiré de la comparaison' };
  }

  @Get()
  @ApiOperation({
    summary: 'Récupérer la liste de comparaison',
    description: 'Récupère tous les produits de la liste de comparaison de l\'utilisateur connecté'
  })
  @ApiResponse({
    status: 200,
    description: 'Liste de comparaison récupérée avec succès',
    schema: {
      example: [
        {
          id: 1,
          userId: 1,
          productId: 5,
          createdAt: '2024-01-15T10:30:00Z',
          product: {
            id: 5,
            name: 'Fraise diamantée',
            price: 45.99,
            images: [],
            categories: []
          }
        }
      ]
    }
  })
  async getUserComparison(@CurrentUser() user: User) {
    return this.comparisonService.getUserComparison(user.id);
  }

  @Get('check/:productId')
  @ApiOperation({
    summary: 'Vérifier si un produit est dans la comparaison',
    description: 'Vérifie si un produit spécifique est dans la liste de comparaison de l\'utilisateur'
  })
  @ApiParam({
    name: 'productId',
    description: 'ID du produit à vérifier',
    example: 5
  })
  @ApiResponse({
    status: 200,
    description: 'Statut vérifié avec succès',
    schema: {
      example: { isInComparison: true }
    }
  })
  async isInComparison(
    @CurrentUser() user: User,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const isInComparison = await this.comparisonService.isInComparison(user.id, productId);
    return { isInComparison };
  }

  @Get('count')
  @ApiOperation({
    summary: 'Compter les éléments de la comparaison',
    description: 'Retourne le nombre total d\'éléments dans la liste de comparaison'
  })
  @ApiResponse({
    status: 200,
    description: 'Nombre d\'éléments récupéré avec succès',
    schema: {
      example: { count: 3, canAdd: true, remainingSlots: 1 }
    }
  })
  async getComparisonCount(@CurrentUser() user: User) {
    const count = await this.comparisonService.getComparisonCount(user.id);
    const canAddInfo = await this.comparisonService.canAddToComparison(user.id);
    return { count, ...canAddInfo };
  }

  @Delete()
  @ApiOperation({
    summary: 'Vider la liste de comparaison',
    description: 'Supprime tous les éléments de la liste de comparaison de l\'utilisateur'
  })
  @ApiResponse({
    status: 200,
    description: 'Liste de comparaison vidée avec succès'
  })
  async clearComparison(@CurrentUser() user: User) {
    await this.comparisonService.clearComparison(user.id);
    return { message: 'Liste de comparaison vidée' };
  }

  @Get('details')
  @ApiOperation({
    summary: 'Détails de la comparaison',
    description: 'Récupère les détails complets de la comparaison avec matrice et résumé'
  })
  @ApiResponse({
    status: 200,
    description: 'Détails de comparaison récupérés avec succès',
    schema: {
      example: {
        products: [],
        comparisonMatrix: {
          price: { min: 25.99, max: 89.99, average: 52.49 },
          weight: { min: 0.1, max: 0.5, average: 0.3 },
          brands: ['Brand A', 'Brand B'],
          categories: ['Fraises', 'Instruments'],
          stockStatus: { inStock: 3, outOfStock: 1 }
        },
        summary: {
          totalProducts: 4,
          priceRange: '25.99 € - 89.99 €',
          averagePrice: '52.49',
          uniqueBrands: 2,
          uniqueCategories: 2
        }
      }
    }
  })
  async getComparisonDetails(@CurrentUser() user: User) {
    return this.comparisonService.getComparisonDetails(user.id);
  }

  @Get('recommendations')
  @ApiOperation({
    summary: 'Recommandations basées sur la comparaison',
    description: 'Récupère des produits recommandés basés sur les produits en comparaison'
  })
  @ApiResponse({
    status: 200,
    description: 'Recommandations récupérées avec succès',
    schema: {
      example: [
        {
          id: 10,
          name: 'Produit similaire',
          price: 45.99,
          images: [],
          categories: []
        }
      ]
    }
  })
  async getComparisonRecommendations(@CurrentUser() user: User) {
    return this.comparisonService.getComparisonRecommendations(user.id);
  }

  @Get('can-add')
  @ApiOperation({
    summary: 'Vérifier si on peut ajouter des produits',
    description: 'Vérifie si l\'utilisateur peut ajouter plus de produits à la comparaison'
  })
  @ApiResponse({
    status: 200,
    description: 'Information de capacité récupérée avec succès',
    schema: {
      example: {
        canAdd: true,
        currentCount: 2,
        maxCount: 4,
        remainingSlots: 2
      }
    }
  })
  async canAddToComparison(@CurrentUser() user: User) {
    return this.comparisonService.canAddToComparison(user.id);
  }
}
