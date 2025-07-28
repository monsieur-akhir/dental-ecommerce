import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { Throttle } from '../common/decorators/throttle.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../entities';

@ApiTags('auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle(5, 60) // 5 tentatives par minute
  @ApiOperation({ 
    summary: 'Inscription d\'un nouvel utilisateur',
    description: 'Crée un nouveau compte utilisateur avec le rôle client par défaut'
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Utilisateur créé avec succès',
    schema: {
      example: {
        user: {
          id: 1,
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: { id: 2, name: 'client' }
        },
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  @ApiResponse({ status: 429, description: 'Trop de tentatives' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Throttle(10, 60) // 10 tentatives par minute
  @ApiOperation({ 
    summary: 'Connexion utilisateur',
    description: 'Authentifie un utilisateur et retourne un token JWT'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Connexion réussie',
    schema: {
      example: {
        user: {
          id: 1,
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: { id: 2, name: 'client' }
        },
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  @ApiResponse({ status: 429, description: 'Trop de tentatives' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Profil utilisateur',
    description: 'Récupère les informations du profil de l\'utilisateur connecté'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Profil récupéré avec succès',
    schema: {
      example: {
        id: 1,
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: { id: 2, name: 'client' },
        isActive: true
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token invalide ou manquant' })
  async getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    };
  }
}

