import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    // 1. Pass the Entity Class and the Entity Manager to the parent
    super(User, dataSource.createEntityManager());
  }

  // 2. Add your custom business-specific queries here
  async existsByEmailOrUsername(email: string, username: string): Promise<User | null> {
    return this.createQueryBuilder('user')
      .where('user.email = :email or user.username = :username', { email: email, username: username })
      .getOne();
  }
}