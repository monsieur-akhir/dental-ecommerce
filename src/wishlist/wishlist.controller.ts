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
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../entities';

@ApiTags('wishlist')
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  @ApiOperation({
    summary: 'Ajouter un produit à la liste de souhaits',
    description: 'Ajoute un produit à la liste de souhaits de l\'utilisateur connecté'
  })
  @ApiBody({ type: AddToWishlistDto })
  @ApiResponse({
    status: 201,
    description: 'Produit ajouté à la liste de souhaits avec succès',
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
  @ApiResponse({ status: 404, description: 'Produit non trouvé' })
  @ApiResponse({ status: 409, description: 'Produit déjà dans la liste de souhaits' })
  async addToWishlist(
    @CurrentUser() user: User,
    @Body() addToWishlistDto: AddToWishlistDto,
  ) {
    return this.wishlistService.addToWishlist(user.id, addToWishlistDto);
  }

  @Delete(':productId')
  @ApiOperation({
    summary: 'Retirer un produit de la liste de souhaits',
    description: 'Retire un produit de la liste de souhaits de l\'utilisateur connecté'
  })
  @ApiParam({
    name: 'productId',
    description: 'ID du produit à retirer',
    example: 5
  })
  @ApiResponse({
    status: 200,
    description: 'Produit retiré de la liste de souhaits avec succès'
  })
  @ApiResponse({ status: 404, description: 'Produit non trouvé dans la liste de souhaits' })
  async removeFromWishlist(
    @CurrentUser() user: User,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    await this.wishlistService.removeFromWishlist(user.id, productId);
    return { message: 'Produit retiré de la liste de souhaits' };
  }

  @Get()
  @ApiOperation({
    summary: 'Récupérer la liste de souhaits',
    description: 'Récupère tous les produits de la liste de souhaits de l\'utilisateur connecté'
  })
  @ApiResponse({
    status: 200,
    description: 'Liste de souhaits récupérée avec succès',
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
  async getUserWishlist(@CurrentUser() user: User) {
    return this.wishlistService.getUserWishlist(user.id);
  }

  @Get('check/:productId')
  @ApiOperation({
    summary: 'Vérifier si un produit est dans la liste de souhaits',
    description: 'Vérifie si un produit spécifique est dans la liste de souhaits de l\'utilisateur'
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
      example: { isInWishlist: true }
    }
  })
  async isInWishlist(
    @CurrentUser() user: User,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const isInWishlist = await this.wishlistService.isInWishlist(user.id, productId);
    return { isInWishlist };
  }

  @Get('count')
  @ApiOperation({
    summary: 'Compter les éléments de la liste de souhaits',
    description: 'Retourne le nombre total d\'éléments dans la liste de souhaits'
  })
  @ApiResponse({
    status: 200,
    description: 'Nombre d\'éléments récupéré avec succès',
    schema: {
      example: { count: 5 }
    }
  })
  async getWishlistCount(@CurrentUser() user: User) {
    const count = await this.wishlistService.getWishlistCount(user.id);
    return { count };
  }

  @Delete()
  @ApiOperation({
    summary: 'Vider la liste de souhaits',
    description: 'Supprime tous les éléments de la liste de souhaits de l\'utilisateur'
  })
  @ApiResponse({
    status: 200,
    description: 'Liste de souhaits vidée avec succès'
  })
  async clearWishlist(@CurrentUser() user: User) {
    await this.wishlistService.clearWishlist(user.id);
    return { message: 'Liste de souhaits vidée' };
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Statistiques de la liste de souhaits',
    description: 'Récupère les statistiques de la liste de souhaits (nombre d\'éléments, valeur totale, etc.)'
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques récupérées avec succès',
    schema: {
      example: {
        totalItems: 5,
        totalValue: 234.95,
        categories: {
          'Fraises': 2,
          'Instruments': 3
        }
      }
    }
  })
  async getWishlistStats(@CurrentUser() user: User) {
    return this.wishlistService.getWishlistStats(user.id);
  }

  @Post('move-to-cart/:productId')
  @ApiOperation({
    summary: 'Déplacer vers le panier',
    description: 'Déplace un produit de la liste de souhaits vers le panier'
  })
  @ApiParam({
    name: 'productId',
    description: 'ID du produit à déplacer',
    example: 5
  })
  @ApiResponse({
    status: 200,
    description: 'Produit déplacé vers le panier avec succès'
  })
  async moveToCart(
    @CurrentUser() user: User,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    await this.wishlistService.moveToCart(user.id, productId);
    return { message: 'Produit déplacé vers le panier' };
  }
}
