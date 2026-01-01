import { KafkaOptions, Transport } from "@nestjs/microservices";

export default () => ({
  kafkaConfig: {
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKER],
      },
      consumer: {
        groupId: process.env.KAFKA_GROUP_ID,
        allowAutoTopicCreation: true,
      },
      run: {
        autoCommit: false
      }
    }
  } as KafkaOptions,
  smtp_mail: {
    host: process.env.MAIL_SMTP_HOST,
    port: process.env.MAIL_SMTP_PORT,
    secure:
      process.env.MAIL_SMTP_IS_SECURE &&
      process.env.MAIL_SMTP_IS_SECURE === '1',
    username: process.env.MAIL_SMTP_USERNAME,
    password: process.env.MAIL_SMTP_PASSWORD,
    defaults: {
      from: process.env.MAIL_SMTP_FROM,
    },
  },
});