import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, Role, RoleType } from '../entities';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private jwtService: JwtService,
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

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Utilisateur non valide');
    }

    return user;
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role?.name || RoleType.CLIENT,
    };

    return this.jwtService.sign(payload);
  }
}
