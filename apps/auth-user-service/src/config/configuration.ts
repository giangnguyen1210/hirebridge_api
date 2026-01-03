export default () => ({
  auth: {
    jwt_secret: process.env.JWT_SECRET || 'default_secret',
    jwt_expires_in: process.env.JWT_EXPIRES_IN || '15m',
    jwt_refresh: process.env.JWT_REFRESH_SECRET || 'default_secret',
    jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  database: {
    host: process.env.POSTGRES_HOST || 'localhost',
    url: process.env.DATABASE_URL,
    postgres_user: process.env.POSTGRES_USER,
    postgres_password: process.env.POSTGRES_PASSWORD,
    postgres_db: process.env.POSTGRES_DB,
    postgres_port: process.env.POSTGRES_PORT ? process.env.POSTGRES_PORT : 5432,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  },
  kafka: {
    KAFKA_BROKER: process.env.KAFKA_BROKER || 'localhost:29092',
    KAFKA_GROUP_ID: process.env.KAFKA_GROUP_ID || 'auth-user-service-group',
  }
});