import { DataSource } from 'typeorm';

export const AuthDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : 5432,
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'hirebridge_auth',

  entities: ['dist/apps/auth-user-service/**/*.entity.js'],
  migrations: ['dist/apps/auth-user-service/infrastructure/database/migrations/*.js'],

  synchronize: false,
});
