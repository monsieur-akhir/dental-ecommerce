import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role, RoleType } from '../entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, roleId, ...userData } = createUserDto;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Vérifier que le rôle existe
    if (roleId) {
      const role = await this.roleRepository.findOne({ where: { id: roleId } });
      if (!role) {
        throw new NotFoundException(`Rôle avec l'ID ${roleId} non trouvé`);
      }
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      roleId,
      ...userData,
    });

    const savedUser = await this.userRepository.save(user);

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as User;
  }

  async findAll(options?: {
    isActive?: boolean;
    roleId?: number;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ users: User[]; total: number }> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.phone',
        'user.address',
        'user.city',
        'user.postalCode',
        'user.country',
        'user.isActive',
        'user.createdAt',
        'user.updatedAt',
        'role.id',
        'role.name',
      ])
      .orderBy('user.createdAt', 'DESC');

    if (options?.isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', {
        isActive: options.isActive,
      });
    }

    if (options?.roleId) {
      queryBuilder.andWhere('user.roleId = :roleId', {
        roleId: options.roleId,
      });
    }

    if (options?.search) {
      queryBuilder.andWhere(
        '(user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return { users, total };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'phone',
        'address',
        'city',
        'postalCode',
        'country',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const { password, email, roleId, ...userData } = updateUserDto;

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== user.email) {
      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new ConflictException('Un utilisateur avec cet email existe déjà');
      }
    }

    // Vérifier que le rôle existe
    if (roleId) {
      const role = await this.roleRepository.findOne({ where: { id: roleId } });
      if (!role) {
        throw new NotFoundException(`Rôle avec l'ID ${roleId} non trouvé`);
      }
    }

    // Hasher le nouveau mot de passe si fourni
    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    // Mettre à jour l'utilisateur
    Object.assign(user, {
      ...userData,
      ...(email && { email }),
      ...(roleId && { roleId }),
      ...(hashedPassword && { password: hashedPassword }),
    });

    await this.userRepository.save(user);

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    await this.userRepository.remove(user);
  }

  async toggleActive(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    user.isActive = !user.isActive;
    await this.userRepository.save(user);

    return this.findOne(id);
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    adminUsers: number;
    clientUsers: number;
  }> {
    try {
      // Statistiques de base
      const totalUsers = await this.userRepository.count();
      const activeUsers = await this.userRepository.count({ where: { isActive: true } });
      const inactiveUsers = await this.userRepository.count({ where: { isActive: false } });

      // Compter les utilisateurs par rôle
      const adminRole = await this.roleRepository.findOne({ where: { name: RoleType.ADMIN } });
      const clientRole = await this.roleRepository.findOne({ where: { name: RoleType.CLIENT } });

      const adminUsers = adminRole
        ? await this.userRepository.count({ where: { roleId: adminRole.id } })
        : 0;
      const clientUsers = clientRole
        ? await this.userRepository.count({ where: { roleId: clientRole.id } })
        : 0;

      return {
        totalUsers,
        activeUsers,
        inactiveUsers,
        adminUsers,
        clientUsers,
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques utilisateurs:', error);
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        adminUsers: 0,
        clientUsers: 0,
      };
    }
  }
}
