import { MigrationInterface, QueryRunner } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();

/** 用户表管理员初始处理 */
export class UserInit1662784996814 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const prefix = configService.get('DATABASE_PREFIX'),
      userTableName = `${prefix}user`,
      userTableExist = await queryRunner.hasTable(userTableName);

    if (userTableExist) {
      const users = await queryRunner.query(`SELECT * FROM \`${userTableName}\` WHERE \`username\` = 'admin'`);

      if (users.length === 0) {
        // 密码 123456
        const password =
          '$argon2id$v=19$m=4096,t=3,p=1$uQPhs0kJ5kMVdlfv91v+4w$pvANYWpi9zldy54cpedJckHOmHl4GYUd1GL65ggsE8U';
        const refreshToken =
          '$argon2id$v=19$m=19456,t=2,p=1$0eVC1LSZzYPXiEmvBo2DnA$e8TP1XwWz3XalSN5gfGlEvkA4+9N3oQfl6ZW0zWkkOc';
        const avatar = ``;
        await queryRunner.query(
          `INSERT INTO \`${userTableName}\` (\`avatar\`, \`username\`, \`nickname\`, \`email\`, \`password\`, \`refresh_token\`, \`is_system\`) VALUES ('${avatar}','admin', '管理员', 'admin@weishour.com', '${password}', '${refreshToken}', 1)`,
        );
      }
    }
  }

  public async down(): Promise<void> {}
}
