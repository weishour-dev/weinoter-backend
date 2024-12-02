import {
  Entity,
  Column,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { RoleEntity } from '@ws/app/systems/roles/role.entity';
import { UserGroupEntity } from '@ws/app/systems/user-groups/user-group.entity';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn({ unsigned: true, comment: '用户id' })
  id: number;

  @Column({ default: '', unique: true, comment: '用户名' })
  username: string;

  @Column({ default: '', comment: '昵称' })
  nickname: string;

  @Column({ default: '', unique: true, comment: '邮箱' })
  email: string;

  @Column({ default: '', select: false, comment: '登录密码' })
  password: string;

  @Column({ default: false, name: 'remember_me', comment: '记住我' })
  rememberMe: boolean;

  @Column({ nullable: true, type: 'longtext', comment: '头像' })
  avatar: string;

  @Column({ name: 'department_ids', nullable: true, type: 'simple-array', comment: '所属部门id' })
  departmentIds: number[];

  @Column({ nullable: true, type: 'text', comment: '关于我' })
  about: string;

  @Column({ default: 'Activated', comment: '状态' })
  status: string;

  @Column({ default: '', select: false, name: 'refresh_token', comment: '刷新token' })
  @Exclude()
  refreshToken: string;

  @Column({ default: 0, comment: '排序' })
  sort: number;

  @Column({ default: false, name: 'is_system', comment: '系统内置' })
  isSystem: boolean;

  @CreateDateColumn({ name: 'created_time', comment: '创建时间' })
  createdTime: Date;

  @UpdateDateColumn({ name: 'updated_time', comment: '更新时间' })
  updatedTime: Date;

  @ManyToMany(() => RoleEntity)
  @JoinTable({
    name: 'user_link_role',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'role_id' },
  })
  roles: RoleEntity[];

  @ManyToMany(() => UserGroupEntity)
  @JoinTable({
    name: 'user_link_user_group',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'user_group_id' },
  })
  userGroups: UserGroupEntity[];
}
