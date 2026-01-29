import {
  Entity,
  Column,
  BeforeInsert,
  OneToMany,
  DeleteDateColumn,
  BeforeUpdate,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { BaseEntity } from '../../common/entities/base.entity';
import { UserStatus } from '@app/common/enum';

/**
 * User Role Enum
 * Defines the available roles in the system
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
  FREELANCER = 'FREELANCER',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true, nullable: true })
  username: string;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatar: string;

  @Exclude()
  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status: UserStatus;

  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  activateToken: string | null;

  @Exclude()
  @Column({ type: 'timestamp', nullable: true })
  tokenExpire: Date | null;

  @Exclude()
  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @Exclude()
  @DeleteDateColumn()
  deletedAt: Date;

  @Exclude()
  @Column({ nullable: true })
  blockedAt: Date;

  /**
   * Roles - Array of roles assigned to this user
   * A user can have multiple roles (e.g., both CLIENT and FREELANCER)
   */
  @Column({
    type: 'enum',
    enum: UserRole,
    array: true,
    default: [],
  })
  roles: UserRole[];

  /**
   * Active Role - Currently selected role by the user
   * This allows users to switch between their assigned roles
   * Must be one of the roles in the roles array
   */
  @Column({
    type: 'enum',
    enum: UserRole,
    nullable: true,
  })
  activeRole: UserRole | null;

  /**
   * Get primary role (for backward compatibility)
   * Returns activeRole if set, otherwise the first role in the array
   */
  getPrimaryRole(): UserRole | null {
    return this.activeRole || this.roles?.[0] || null;
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: UserRole): boolean {
    return this.roles?.includes(role) || false;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  /**
   * Check if user has all of the specified roles
   */
  hasAllRoles(roles: UserRole[]): boolean {
    return roles.every((role) => this.hasRole(role));
  }

  /**
   * Set active role (must be one of user's assigned roles)
   * Returns true if successful, false if role is not assigned to user
   */
  setActiveRole(role: UserRole): boolean {
    if (this.hasRole(role)) {
      this.activeRole = role;
      return true;
    }
    return false;
  }

  /**
   * Add a role to user's roles array (if not already present)
   */
  addRole(role: UserRole): void {
    if (!this.roles) {
      this.roles = [];
    }
    if (!this.hasRole(role)) {
      this.roles.push(role);
      // Set as active role if it's the first role
      if (this.roles.length === 1) {
        this.activeRole = role;
      }
    }
  }

  /**
   * Remove a role from user's roles array
   */
  removeRole(role: UserRole): void {
    if (this.roles) {
      this.roles = this.roles.filter((r) => r !== role);
      // Clear activeRole if it was the removed role
      if (this.activeRole === role) {
        this.activeRole = this.roles[0] || null;
      }
    }
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  /**
   * Check if user is client
   */
  isClient(): boolean {
    return this.hasRole(UserRole.CLIENT);
  }

  /**
   * Check if user is freelancer
   */
  isFreelancer(): boolean {
    return this.hasRole(UserRole.FREELANCER);
  }

  /**
   * Validate activeRole before insert/update
   * Ensures activeRole is always one of the assigned roles
   */
  @BeforeInsert()
  @BeforeUpdate()
  validateActiveRole() {
    // Ensure roles is an array
    if (!this.roles) {
      this.roles = [];
    }

    // If activeRole is set but not in roles array, reset it
    if (this.activeRole && !this.roles.includes(this.activeRole)) {
      this.activeRole = this.roles[0] || null;
    }

    // If no activeRole but has roles, set to first role
    if (!this.activeRole && this.roles.length > 0) {
      this.activeRole = this.roles[0];
    }
  }

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compareSync(password, this.password);
  }
}
