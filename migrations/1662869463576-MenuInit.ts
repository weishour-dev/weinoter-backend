import { MigrationInterface, QueryRunner } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();

export class MenuInit1662869463576 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const prefix = configService.get('DATABASE_PREFIX'),
      menuTableName = `${prefix}menu`,
      menuClosureTableName = `${prefix}menu_closure`,
      menuTableExist = await queryRunner.hasTable(menuTableName),
      menuClosureTableExist = await queryRunner.hasTable(menuClosureTableName);

    if (menuTableExist && menuClosureTableExist) {
      await queryRunner.clearTable(menuClosureTableName);

      const menus = await queryRunner.query(`SELECT * FROM \`${menuTableName}\` WHERE \`parentId\` IS NULL`);

      if (menus.length > 0) {
        // 删除已经存在的菜单
        for (const menu of menus) {
          await queryRunner.query(`DELETE FROM \`${menuTableName}\` WHERE \`id\` = ${menu.id}`);
        }
      }

      // 添加系统预设菜单
      await queryRunner.query(
        `INSERT INTO \`${menuTableName}\` (\`id\`, \`parentId\`, \`icon\`, \`title\`, \`type\`, \`link\`, \`sort\`, \`level\`, \`is_system\`) VALUES
        (30, null, 'menus:app_registration', '基础资料', 'group', '', 70, 1, 1),
        (31, 30, 'menus:dvr', '笔记demo', 'basic', '/basedata/demo', 1, 2, 1),
        (1, null, 'menus:cog', '系统管理', 'group', '', 100, 1, 1),
        (2, 1, 'menus:structure', '组织架构', 'collapsable', '', 3, 2, 1),
        (3, 2, 'menus:organizations', '组织管理', 'basic', '/systems/organizations', 1, 3, 1),
        (4, 2, 'menus:users', '用户管理', 'basic', '/systems/users', 2, 3, 1),
        (5, 2, 'menus:user-groups', '用户组管理', 'basic', '/systems/user-groups', 3, 3, 1),
        (6, 1, 'menus:lock', '权限管理', 'collapsable', '', 4, 2, 1),
        (7, 6, 'menus:roles', '角色管理', 'basic', '/systems/roles', 1, 3, 1),
        (8, 6, 'menus:permissions', '常规权限', 'basic', '/systems/permissions', 2, 3, 1),
        (9, 1, 'menus:menu', '菜单管理', 'basic', '/systems/menus', 5, 2, 1)
        `,
      );

      // 添加菜单关联
      await queryRunner.query(
        `INSERT INTO \`${menuClosureTableName}\` (\`id_ancestor\`, \`id_descendant\`) VALUES
        (30, 30),
        (30, 31),
        (31, 31),
        (1, 1),
        (1, 2),(1, 3),(1, 4),(1, 5),(1, 6),(1, 7),(1, 8),(1, 9),
        (2, 2),
        (2, 3),(2, 4),(2, 5),
        (3, 3),(4, 4),(5, 5),
        (6, 6),
        (6, 7),(6, 8),
        (7, 7),(8, 8),(9, 9)
        `,
      );
    }
  }

  public async down(): Promise<void> {}
}
