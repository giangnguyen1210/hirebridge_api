import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository extends Repository<RefreshToken> {
  constructor(private dataSource: DataSource) {
    super(RefreshToken, dataSource.createEntityManager());
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.findOne({ where: { refreshToken: token }, relations: ['user'] });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.delete({ userId });
  }
}
