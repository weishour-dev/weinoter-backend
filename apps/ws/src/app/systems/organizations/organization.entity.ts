import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('organization')
export class OrganizationEntity {
  @PrimaryGeneratedColumn({ unsigned: true, comment: '组织id' })
  id: number;

  @Column({ default: '', unique: true, comment: '编号' })
  code: string;

  @Column({ default: '', unique: true, comment: '名称' })
  name: string;

  @Column({ name: 'leader_user_ids', nullable: true, type: 'simple-array', comment: '负责人id' })
  leaderUserIds: number[];

  @Column({ name: 'members_count', default: 0, comment: '组织人数' })
  membersCount: number;

  @Column({ nullable: true, type: 'text', comment: '描述' })
  description: string;

  @Column({ default: true, comment: '状态' })
  status: boolean;

  @Column({ default: 0, comment: '排序' })
  sort: number;

  @Column({ name: 'department_id', default: 0, comment: '部门根节点id' })
  departmentId: number;

  @CreateDateColumn({ name: 'created_time', comment: '创建时间' })
  createdTime: Date;

  @UpdateDateColumn({ name: 'updated_time', comment: '更新时间' })
  updatedTime: Date;
}
