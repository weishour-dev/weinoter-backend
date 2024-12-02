import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('permission')
@Unique(['menuId', 'type', 'code'])
@Unique(['menuId', 'type', 'name'])
export class PermissionEntity {
  @PrimaryGeneratedColumn({ unsigned: true, comment: '权限id' })
  id: number;

  @Column({ default: '', comment: '编号' })
  code: string;

  @Column({ default: '', comment: '名称' })
  name: string;

  @Column({ name: 'menu_id', default: 0, comment: '菜单id' })
  menuId: number;

  @Column({ default: '', comment: '类型' })
  type: string;

  @Column({ nullable: true, type: 'text', comment: '描述' })
  description: string;

  @Column({ default: true, comment: '状态' })
  status: boolean;

  @Column({ default: 0, comment: '排序' })
  sort: number;

  @CreateDateColumn({ name: 'created_time', comment: '创建时间' })
  createdTime: Date;

  @UpdateDateColumn({ name: 'updated_time', comment: '更新时间' })
  updatedTime: Date;
}
