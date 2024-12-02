import { Entity, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CasbinRule } from '@weishour/core/plugins/typeorm-adapter';

@Entity('casbin_rule')
export class WsCasbinRule extends CasbinRule {
  @CreateDateColumn({ name: 'created_time', comment: '创建时间' })
  createdTime: Date;

  @UpdateDateColumn({ name: 'updated_time', comment: '更新时间' })
  updatedTime: Date;
}
