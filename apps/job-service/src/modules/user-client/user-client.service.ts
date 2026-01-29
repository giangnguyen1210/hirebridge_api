import { Inject, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import { ApiResponse, UserResponseDto } from '@app/common';

@Injectable()
export class UserClientService {
  private readonly logger = new Logger(UserClientService.name);
  private readonly authServiceUrl: string;
  private readonly cacheTTL = 300; // 5 minutes in seconds

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.authServiceUrl = this.configService.get<string>(
      'services.authServiceUrl',
      'http://localhost:3001',
    );
    this.logger.log(`Auth Service URL: ${this.authServiceUrl}`);
  }

  /**
   * Fetch user details by userId with caching
   * @param userId - The user ID to fetch
   * @returns UserResponseDto or null if not found
   */
  async getUserById(userId: string): Promise<UserResponseDto | null> {
    if (!userId) {
      this.logger.warn('getUserById called with empty userId');
      return null;
    }

    const cacheKey = `user:${userId}`;

    try {
      // Try to get from cache first
      const cachedUser = await this.cacheManager.get<UserResponseDto>(cacheKey);
      
      if (cachedUser) {
        this.logger.debug(`Cache HIT for user ${userId}`);
        return cachedUser;
      }

      this.logger.debug(`Cache MISS for user ${userId}`);

      // Cache miss - fetch from auth service
      const url = `${this.authServiceUrl}/users/${userId}`;

      const response = await firstValueFrom(
        this.httpService.get<ApiResponse<UserResponseDto>>(url),
      );

      const userData = response.data;

      // Cache the result
      await this.cacheManager.set(cacheKey, userData.data, this.cacheTTL);
      this.logger.debug(`Cached user ${userId} for ${this.cacheTTL}s`);

      return userData.data ?? null;
    } catch (error) {
      this.logger.error(
        `Failed to fetch user ${userId}: ${error.message}`,
        error.stack,
      );
      
      // Return null on error - caller should handle gracefully
      return null;
    }
  }

  /**
   * Fetch multiple users by their IDs with caching
   * @param userIds - Array of user IDs
   * @returns Map of userId to UserResponseDto
   */
  async getUsersByIds(
    userIds: string[],
  ): Promise<Map<string, UserResponseDto>> {
    const userMap = new Map<string, UserResponseDto>();
    
    if (!userIds || userIds.length === 0) {
      return userMap;
    }

    // Remove duplicates
    const uniqueUserIds = [...new Set(userIds)];

    // Fetch all users in parallel
    const promises = uniqueUserIds.map((userId) => this.getUserById(userId));
    const results = await Promise.all(promises);

    // Build the map
    uniqueUserIds.forEach((userId, index) => {
      const user = results[index];
      if (user) {
        userMap.set(userId, user);
      }
    });

    return userMap;
  }

  /**
   * Invalidate cache for a specific user
   * @param userId - The user ID to invalidate
   */
  async invalidateUserCache(userId: string): Promise<void> {
    const cacheKey = `user:${userId}`;
    await this.cacheManager.del(cacheKey);
    this.logger.debug(`Invalidated cache for user ${userId}`);
  }
}
