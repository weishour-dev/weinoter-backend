import { MigrationInterface, QueryRunner } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();

export class PermissionInit1681896619705 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const prefix = configService.get('DATABASE_PREFIX'),
      menuTableName = `${prefix}menu`,
      menuTableExist = await queryRunner.hasTable(menuTableName),
      permissionTableName = `${prefix}permission`,
      permissionTableExist = await queryRunner.hasTable(permissionTableName);

    if (menuTableExist && permissionTableExist) {
      const menus = await queryRunner.query(`SELECT * FROM \`${menuTableName}\` WHERE \`type\` != 'divider'`);

      for (const menu of menus) {
        const permission = await queryRunner.query(
          `SELECT * FROM \`${permissionTableName}\` WHERE \`menu_id\` = ${menu.id} AND code = 'show' AND type = 'MENU'`,
        );

        // 判断类型为菜单且code为show的权限不存在时添加权限
        if (permission.length === 0) {
          await queryRunner.query(
            `INSERT INTO \`${permissionTableName}\` (\`menu_id\`, \`code\`, \`name\`, \`type\`, \`sort\`) VALUES (${menu.id}, 'show', '显示', 'MENU', 1)`,
          );
        }
      }
    }
  }

  public async down(): Promise<void> {}
}
