import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '../entities';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(RoleType.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(RoleType.ADMIN)
  findAll(
    @Query("isActive") isActive?: string,
    @Query("roleId") roleId?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string,
  ) {
    return this.usersService.findAll({
      isActive: isActive ? isActive === "true" : undefined,
      roleId: roleId ? parseInt(roleId) : undefined,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
    });
  }

  @Get("stats")
  @Roles(RoleType.ADMIN)
  async getStats() {
    console.log('👥 Demande de statistiques utilisateurs...');
    try {
      const stats = await this.usersService.getUserStats();
      console.log('✅ Statistiques utilisateurs récupérées:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques utilisateurs:', error);
      throw error;
    }
  }

  @Get(":id")
  @Roles(RoleType.ADMIN)
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(":id")
  @Roles(RoleType.ADMIN)
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Patch(":id/toggle-active")
  @Roles(RoleType.ADMIN)
  toggleActive(@Param("id") id: string) {
    return this.usersService.toggleActive(+id);
  }

  @Delete(":id")
  @Roles(RoleType.ADMIN)
  remove(@Param("id") id: string) {
    return this.usersService.remove(+id);
  }
}


