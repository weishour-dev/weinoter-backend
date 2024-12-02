import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Tree,
  TreeParent,
  TreeChildren,
  TreeLevelColumn,
  Unique,
} from 'typeorm';

@Entity('department')
@Tree('closure-table')
@Unique(['organizationCode', 'code'])
@Unique(['organizationCode', 'name', 'level'])
export class DepartmentEntity {
  @PrimaryGeneratedColumn({ comment: '部门id' })
  id: number;

  @Column({ default: '', name: 'organization_code', comment: '组织编号' })
  organizationCode: string;

  @TreeParent({ onDelete: 'CASCADE' })
  parent: DepartmentEntity;

  @Column({ nullable: true })
  parentId: number;

  @Column({ default: '', unique: true, comment: '编号' })
  code: string;

  @Column({ default: '', comment: '名称' })
  name: string;

  @Column({ name: 'leader_user_ids', nullable: true, type: 'simple-array', comment: '负责人id' })
  leaderUserIds: number[];

  @Column({ name: 'members_count', default: 0, comment: '部门人数(直属)' })
  membersCount: number;

  @Column({ nullable: true, type: 'text', comment: '描述' })
  description: string;

  @Column({ default: true, comment: '状态' })
  status: boolean;

  @Column({ default: 0, comment: '排序' })
  sort: number;

  @TreeChildren()
  children: DepartmentEntity[];

  @TreeLevelColumn()
  @Column({ default: 1 })
  level: number;

  @CreateDateColumn({ name: 'created_time', comment: '创建时间' })
  createdTime: Date;

  @UpdateDateColumn({ name: 'updated_time', comment: '更新时间' })
  updatedTime: Date;
}
