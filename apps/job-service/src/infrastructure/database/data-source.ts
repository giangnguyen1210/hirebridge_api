import { DataSource } from 'typeorm';

export const JobDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST_JOB,
  port: process.env.POSTGRES_PORT_JOB ? parseInt(process.env.POSTGRES_PORT_JOB) : 5433,
  username: process.env.POSTGRES_USER_JOB,
  password: process.env.POSTGRES_PASSWORD_JOB,
  database: process.env.POSTGRES_DB_JOB,

  entities: ['dist/apps/job-service/**/*.entity.js'],
  migrations: ['dist/apps/job-service/src/infrastructure/database/migrations/*.js'],

  synchronize: false,
});
