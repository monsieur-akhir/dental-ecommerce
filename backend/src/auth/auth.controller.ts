import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto';
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

  @Post('forgot-password')
  @Throttle(3, 60) // 3 tentatives par minute
  @ApiOperation({ 
    summary: 'Demande de réinitialisation de mot de passe',
    description: 'Envoie un email de réinitialisation de mot de passe'
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Email envoyé avec succès (si l\'email existe)',
    schema: {
      example: {
        message: 'Si cet email existe dans notre base de données, vous recevrez un email de réinitialisation.'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Données invalides ou compte désactivé' })
  @ApiResponse({ status: 429, description: 'Trop de tentatives' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @Throttle(5, 60) // 5 tentatives par minute
  @ApiOperation({ 
    summary: 'Réinitialisation de mot de passe',
    description: 'Réinitialise le mot de passe avec un token reçu par email'
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Mot de passe mis à jour avec succès',
    schema: {
      example: {
        message: 'Mot de passe mis à jour avec succès'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Token invalide ou expiré' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 429, description: 'Trop de tentatives' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Changement de mot de passe',
    description: 'Change le mot de passe de l\'utilisateur connecté'
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Mot de passe mis à jour avec succès',
    schema: {
      example: {
        message: 'Mot de passe mis à jour avec succès'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Ancien mot de passe incorrect ou nouveau mot de passe invalide' })
  @ApiResponse({ status: 401, description: 'Token invalide ou manquant' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return this.authService.changePassword(user.id, changePasswordDto);
  }
}

