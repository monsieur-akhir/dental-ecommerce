import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, Role, RoleType } from '../entities';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: User; token: string }> {
    const { email, password, ...userData } = registerDto;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Récupérer le rôle client par défaut
    const clientRole = await this.roleRepository.findOne({ where: { name: RoleType.CLIENT } });
    if (!clientRole) {
      throw new Error('Rôle client non trouvé');
    }

    // Créer l'utilisateur
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      ...userData,
      roleId: clientRole.id,
    });

    const savedUser = await this.userRepository.save(user);

    // Générer le token JWT
    const token = this.generateToken(savedUser);

    // Envoyer l'email de bienvenue (en arrière-plan)
    if (userData.firstName) {
      this.emailService.sendWelcomeEmail(email, userData.firstName).then(result => {
        if (result.success) {
          console.log(`✅ Email de bienvenue envoyé avec succès à ${email}`);
        } else {
          console.error(`❌ Échec de l'envoi de l'email de bienvenue à ${email}:`, result.message);
          console.error(`📋 Détails:`, result.details);
        }
      }).catch(error => {
        console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', error);
      });
    }

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = savedUser;

    return {
      user: userWithoutPassword as User,
      token,
    };
  }

  async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
    const { email, password } = loginDto;

    // Trouver l'utilisateur avec son rôle
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      throw new UnauthorizedException('Compte désactivé');
    }

    // Générer le token JWT
    const token = this.generateToken(user);

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as User,
      token,
    };
  }

  async validateUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    return user;
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role?.name,
    };

    return this.jwtService.sign(payload);
  }

  // Générer un token de réinitialisation de mot de passe
  private generateResetToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      type: 'password_reset',
    };

    return this.jwtService.sign(payload, { expiresIn: '1h' });
  }

  // Demande de réinitialisation de mot de passe
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
      return { message: 'Si cet email existe dans notre base de données, vous recevrez un email de réinitialisation.' };
    }

    if (!user.isActive) {
      throw new BadRequestException('Ce compte est désactivé');
    }

    // Générer un token de réinitialisation
    const resetToken = this.generateResetToken(user);

    // Envoyer l'email de réinitialisation
    try {
      const emailResult = await this.emailService.sendPasswordResetEmail(
        user.email,
        user.firstName || 'Utilisateur',
        resetToken
      );
      
      if (!emailResult.success) {
        console.error('Échec de l\'envoi de l\'email de réinitialisation:', emailResult.message);
        console.error('Détails:', emailResult.details);
        throw new BadRequestException('Erreur lors de l\'envoi de l\'email de réinitialisation');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
      throw new BadRequestException('Erreur lors de l\'envoi de l\'email de réinitialisation');
    }

    return { message: 'Si cet email existe dans notre base de données, vous recevrez un email de réinitialisation.' };
  }

  // Réinitialisation de mot de passe avec token
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, password } = resetPasswordDto;

    try {
      // Vérifier le token
      const payload = this.jwtService.verify(token);
      
      if (payload.type !== 'password_reset') {
        throw new BadRequestException('Token invalide');
      }

      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      if (!user.isActive) {
        throw new BadRequestException('Ce compte est désactivé');
      }

      // Hasher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(password, 12);

      // Mettre à jour le mot de passe
      user.password = hashedPassword;
      await this.userRepository.save(user);

      // Envoyer l'email de confirmation de réinitialisation réussie
      try {
        const emailResult = await this.emailService.sendPasswordResetSuccessEmail(
          user.email,
          user.firstName || 'Utilisateur'
        );
        
        if (emailResult.success) {
          console.log(`✅ Email de confirmation de réinitialisation envoyé avec succès à ${user.email}`);
        } else {
          console.error(`❌ Échec de l'envoi de l'email de confirmation de réinitialisation à ${user.email}:`, emailResult.message);
          console.error(`📋 Détails:`, emailResult.details);
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error);
        // On ne fait pas échouer la requête si l'email ne peut pas être envoyé
      }

      return { message: 'Mot de passe mis à jour avec succès' };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('Le lien de réinitialisation a expiré');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new BadRequestException('Token invalide');
      }
      throw error;
    }
  }

  // Changement de mot de passe pour utilisateur connecté
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier l'ancien mot de passe
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('L\'ancien mot de passe est incorrect');
    }

    // Vérifier que le nouveau mot de passe est différent
    if (currentPassword === newPassword) {
      throw new BadRequestException('Le nouveau mot de passe doit être différent de l\'ancien');
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Mettre à jour le mot de passe
    user.password = hashedPassword;
    await this.userRepository.save(user);

    // Envoyer l'email de confirmation de changement de mot de passe
    try {
      const emailResult = await this.emailService.sendPasswordChangeEmail(
        user.email,
        user.firstName || 'Utilisateur'
      );
      
      if (emailResult.success) {
        console.log(`✅ Email de changement de mot de passe envoyé avec succès à ${user.email}`);
      } else {
        console.error(`❌ Échec de l'envoi de l'email de changement de mot de passe à ${user.email}:`, emailResult.message);
        console.error(`📋 Détails:`, emailResult.details);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de changement de mot de passe:', error);
      // On ne fait pas échouer la requête si l'email ne peut pas être envoyé
    }

    return { message: 'Mot de passe mis à jour avec succès' };
  }
}
