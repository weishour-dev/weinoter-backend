import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { UserEntity } from '@ws/app/systems/users/user.entity';

@Entity('role')
export class RoleEntity {
  @PrimaryGeneratedColumn({ unsigned: true, comment: '角色id' })
  id: number;

  @Column({ default: '', unique: true, comment: '编号' })
  code: string;

  @Column({ default: '', unique: true, comment: '名称' })
  name: string;

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

  @ManyToMany(() => UserEntity)
  @JoinTable({
    name: 'user_link_role',
    joinColumn: { name: 'role_id' },
    inverseJoinColumn: { name: 'user_id' },
  })
  users: UserEntity[];
}
