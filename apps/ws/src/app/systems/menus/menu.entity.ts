import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Tree,
  TreeChildren,
  TreeParent,
  TreeLevelColumn,
} from 'typeorm';

@Entity('menu')
@Tree('closure-table')
export class MenuEntity {
  @PrimaryGeneratedColumn({ comment: '菜单id' })
  id: number;

  @TreeParent({ onDelete: 'CASCADE' })
  parent: MenuEntity;

  @Column({ nullable: true })
  parentId: number;

  @Column({ default: '', comment: '图标' })
  icon: string;

  @Column({ default: '', comment: '标题' })
  title: string;

  @Column({ default: '', comment: '翻译键名' })
  translation: string;

  @Column({ default: '', comment: '副标题' })
  subtitle: string;

  @Column({ default: '', comment: '类型' })
  type: string;

  @Column({ default: false, comment: '是否隐藏' })
  hidden: boolean;

  @Column({ default: false, comment: '是否活动' })
  active: boolean;

  @Column({ default: false, comment: '是否禁用' })
  disabled: boolean;

  @Column({ default: '', comment: '工具提示' })
  tooltip: string;

  @Column({ default: '', comment: '路由链接或者是外部链接' })
  link: string;

  @Column({ nullable: true, comment: '哈希片段' })
  fragment: string;

  @Column({ default: false, comment: 'link是否被解析为外部链接' })
  externalLink: boolean;

  @Column({ default: '', comment: '外部链接的目标属性' })
  target: string;

  @Column({ default: false, comment: '在[routerLinkActiveOptions]上设置确切的参数' })
  exactMatch: boolean;

  @Column({ default: '', name: 'badge_title', comment: '图标' })
  badgeTitle: string;

  @Column({ default: 0, comment: '排序' })
  sort: number;

  @Column({ default: true, comment: '路由复用' })
  reuse: boolean;

  @Column({ default: true, name: 'reuse_closeable', comment: '标签关闭' })
  reuseCloseable: boolean;

  @Column({ default: false, name: 'is_system', comment: '系统内置' })
  isSystem: boolean;

  @TreeChildren()
  children: MenuEntity[];

  @TreeLevelColumn()
  @Column({ default: 1 })
  level: number;

  @CreateDateColumn({ name: 'created_time', comment: '创建时间' })
  createdTime: Date;

  @UpdateDateColumn({ name: 'updated_time', comment: '更新时间' })
  updatedTime: Date;
}
