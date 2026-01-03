import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { UsersRepository } from "../repositories/user.repository";
import { RoleRepository } from "../repositories/role.repository";
import { UserRoleRepository } from "../repositories/user-role.repository";
import { UserRoleEntity } from "../entities/user-role.entity";
import { In } from "typeorm";

@Injectable()
export class UserRoleService{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly roleRepository: RoleRepository,
    private readonly userRoleRepository: UserRoleRepository,
  ) {}

  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    // Find user
    const user = await this.usersRepository.findOne({ 
      where: { id: userId }, 
      relations: ['userRoles', 'userRoles.role'] 
    });
  
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find role by roleId
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`Role with role id '${roleId}' not found`);
    }

    // Check if user already has this role
    const existingUserRole = user.userRoles.find(ur => ur.role.id === role.id);
    if (existingUserRole) {
      throw new BadRequestException('User already has this role');
    }

    // Create new user-role association
    const userRole = new UserRoleEntity();
    userRole.user = user;
    userRole.role = role;

    await this.userRoleRepository.save(userRole);
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    // Find the user-role association
    const userRole = await this.userRoleRepository.findOne({
      where: {
        user: { id: userId },
        role: { id: roleId }
      }
    });

    if (!userRole) {
      throw new NotFoundException('User-role association not found');
    }

    await this.userRoleRepository.remove(userRole);
  }

  /**
   * Synchronize user roles with the provided role IDs
   * This will remove roles not in the list and add new ones
   */
  async syncUserRoles(userId: string, roleIds: string[]): Promise<void> {
    // Find user with current roles
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['userRoles', 'userRoles.role']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate all role IDs exist
    if (roleIds.length > 0) {
      const roles = await this.roleRepository.find({
        where: { id: In(roleIds) }
      });

      if (roles.length !== roleIds.length) {
        throw new NotFoundException('One or more roles not found');
      }
    }

    // Get current role IDs
    const currentRoleIds = user.userRoles.map(ur => ur.role.id);

    // Determine which roles to add and remove
    const rolesToAdd = roleIds.filter(roleId => !currentRoleIds.includes(roleId));
    const rolesToRemove = currentRoleIds.filter(roleId => !roleIds.includes(roleId));

    // Remove roles that are no longer assigned
    if (rolesToRemove.length > 0) {
      await this.userRoleRepository.delete({
        user: { id: userId },
        role: { id: In(rolesToRemove) }
      });
    }

    // Add new roles
    if (rolesToAdd.length > 0) {
      const newUserRoles = rolesToAdd.map(roleId => {
        const userRole = new UserRoleEntity();
        userRole.user = user;
        userRole.role = { id: roleId } as any; // TypeORM will handle the relation
        return userRole;
      });

      await this.userRoleRepository.save(newUserRoles);
    }
  }
  
}
