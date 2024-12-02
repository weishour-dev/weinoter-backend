import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class DateEntity {
  @CreateDateColumn({ name: 'created_time', comment: '创建时间' })
  createdTime: Date;

  @UpdateDateColumn({ name: 'updated_time', comment: '更新时间' })
  updatedTime: Date;
}
