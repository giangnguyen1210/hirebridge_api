// apps/user-service/src/modules/role/role.entity.ts
import { Entity, Column, OneToMany } from 'typeorm';
import { UserRoleEntity } from './user-role.entity';
import { BaseEntity } from './base.entity';

@Entity('roles')
export class RoleEntity extends BaseEntity {
  @Column({ length: 50, unique: true })
  code: string; // CLIENT, FREELANCER, ADMIN

  @Column({ length: 100 })
  name: string;

  @OneToMany(() => UserRoleEntity, (ur) => ur.role)
  userRoles: UserRoleEntity[];
}
