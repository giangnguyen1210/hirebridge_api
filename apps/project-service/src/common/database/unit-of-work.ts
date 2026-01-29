import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner, EntityManager } from 'typeorm';

@Injectable()
export class UnitOfWork {
  private queryRunner: QueryRunner;
  private transactionManager: EntityManager;

  constructor(private readonly dataSource: DataSource) {}

  async start(): Promise<void> {
    this.queryRunner = this.dataSource.createQueryRunner();
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();
    this.transactionManager = this.queryRunner.manager;
  }

  async commit(): Promise<void> {
    try {
      await this.queryRunner.commitTransaction();
    } finally {
      await this.queryRunner.release();
    }
  }

  async rollback(): Promise<void> {
    try {
      await this.queryRunner.rollbackTransaction();
    } finally {
      await this.queryRunner.release();
    }
  }

  getManager(): EntityManager {
    if (!this.transactionManager) {
      throw new Error('Unit of Work chưa được khởi động. Hãy gọi start() trước.');
    }
    return this.transactionManager;
  }

  async execute<T>(work: () => Promise<T>): Promise<T> {
    await this.start();
    try {
      const result = await work();
      await this.commit();
      return result;
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }
}
