export default () => ({
  database: {
    host: process.env.POSTGRES_HOST_JOB || 'localhost',
    url: process.env.DATABASE_URL_JOB,
    postgres_user: process.env.POSTGRES_USER_JOB,
    postgres_password: process.env.POSTGRES_PASSWORD_JOB,
    postgres_db: process.env.POSTGRES_DB_JOB,
    postgres_port: process.env.POSTGRES_PORT_JOB ? process.env.POSTGRES_PORT_JOB : 5432,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  },
  kafka: {
    KAFKA_BROKER: process.env.KAFKA_BROKER || 'localhost:29092',
    KAFKA_GROUP_ID: process.env.KAFKA_GROUP_ID || 'auth-user-service-group',
  },
  services: {
    authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  }
});