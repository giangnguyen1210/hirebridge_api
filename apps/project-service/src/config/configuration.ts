export default () => ({
  database: {
    host: process.env.POSTGRES_HOST_PROJECT || 'localhost',
    url: process.env.DATABASE_URL_PROJECT,
    postgres_user: process.env.POSTGRES_USER_PROJECT,
    postgres_password: process.env.POSTGRES_PASSWORD_PROJECT,
    postgres_db: process.env.POSTGRES_DB_PROJECT,
    postgres_port: process.env.POSTGRES_PORT_PROJECT ? process.env.POSTGRES_PORT_PROJECT : 5432,
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