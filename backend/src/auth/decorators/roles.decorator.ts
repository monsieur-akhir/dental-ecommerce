import { SetMetadata } from '@nestjs/common';
import { RoleType } from '../../entities';

export const Roles = (...roles: RoleType[]) => SetMetadata('roles', roles);

