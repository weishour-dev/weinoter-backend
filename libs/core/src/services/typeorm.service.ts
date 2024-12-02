import { Injectable } from '@nestjs/common';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { WsConfigService } from '@weishour/core/services';
import { FindOptionsWhere, FindTreeOptions, TreeRepository } from 'typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private wsConfigService: WsConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      ...this.wsConfigService.get('typeorm'),
      autoLoadEntities: true,
      verboseRetryLog: true,
    };
  }
}

@Injectable()
export class MssqlConfigService implements TypeOrmOptionsFactory {
  constructor(private wsConfigService: WsConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      ...this.wsConfigService.get('mssql'),
      verboseRetryLog: true,
    };
  }
}

/** 方法扩展 */
declare module 'typeorm/repository/TreeRepository' {
  interface TreeRepository<Entity> {
    findTreesBy(
      this: TreeRepository<Entity>,
      options?: FindTreeOptions,
      where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
    ): Promise<Entity[]>;
  }
}

TreeRepository.prototype.findTreesBy = async function <Entity>(
  this: TreeRepository<Entity>,
  options?: FindTreeOptions,
  where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
): Promise<Entity[]> {
  const escapeAlias = (alias: string) => this.manager.connection.driver.escape(alias);
  const escapeColumn = (column: string) => this.manager.connection.driver.escape(column);
  const parentPropertyName = this.manager.connection.namingStrategy.joinColumnName(
    this.metadata.treeParentRelation?.propertyName,
    this.metadata.primaryColumns[0].propertyName,
  );

  const roots = await this.createQueryBuilder('treeEntity')
    .where(`${escapeAlias('treeEntity')}.${escapeColumn(parentPropertyName)} IS NULL`)
    .orderBy(`${escapeAlias('treeEntity')}.sort`, 'ASC')
    .setFindOptions({ where })
    .getMany();

  return Promise.all(roots.map(root => this.findDescendantsTree(root, options)));
};
