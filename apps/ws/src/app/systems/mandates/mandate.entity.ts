import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { ResourceItem } from '@ws/common/interfaces';

@Entity('mandate')
@Unique(['targetType', 'targetId'])
export class MandateEntity {
  @PrimaryGeneratedColumn({ unsigned: true, comment: '授权id' })
  id: number;

  @Column({ name: 'target_type', default: '', comment: '目标对象类型' })
  targetType: string;

  @Column({ name: 'target_id', default: 0, comment: '目标对象id' })
  targetId: number;

  @Column({ name: 'permission_ids', nullable: true, type: 'simple-array', comment: '权限id' })
  permissionIds: number[];

  @Column({ nullable: true, type: 'json', comment: '资源列表' })
  resources: ResourceItem[];

  @CreateDateColumn({ name: 'created_time', comment: '创建时间' })
  createdTime: Date;

  @UpdateDateColumn({ name: 'updated_time', comment: '更新时间' })
  updatedTime: Date;
}
