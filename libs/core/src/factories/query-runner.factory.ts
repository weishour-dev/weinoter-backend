import { Injectable } from '@nestjs/common';
import { QueryRunner, EntityManager, DataSource } from 'typeorm';

/**
 * 用于QueryRunner创建和控制单个数据库连接的状态
 */
export class QueryRunnerTransaction {
  /**
   * 指示连接是否关闭
   */
  destroyed = false;
  constructor(private readonly queryRunner: QueryRunner) {}

  async start(): Promise<void> {
    if (this.queryRunner.isTransactionActive) return;
    return this.queryRunner.startTransaction();
  }

  async commit(): Promise<void> {
    if (this.destroyed) return;
    await this.queryRunner.commitTransaction();
  }

  async rollback(): Promise<void> {
    if (this.destroyed) return;
    await this.queryRunner.rollbackTransaction();
  }

  /**
   * 发布事务，必须在回滚/提交之后调用
   */
  release(): Promise<void> {
    this.destroyed = true;
    return this.queryRunner.release();
  }

  get manager(): EntityManager {
    return this.queryRunner.manager;
  }
}

/**
 * 创建QueryRunnerTransaction
 */
@Injectable()
export class QueryRunnerFactory {
  constructor(private dataSource: DataSource) {}

  async createQueryRunner(): Promise<QueryRunnerTransaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    // await queryRunner.startTransaction(isolationLevel);
    return new QueryRunnerTransaction(queryRunner);
  }
}
