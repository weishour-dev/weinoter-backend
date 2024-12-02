import { registerAs } from '@nestjs/config';

export const RbacConfig = registerAs('rbac', () => ({
  userPrefix: process.env.RBAC_USER_PREFIX,
  rolePrefix: process.env.RBAC_ROLE_PREFIX,
  groupPrefix: process.env.RBAC_GROUP_PREFIX,
  departmentPrefix: process.env.RBAC_DEPARTMENT_PREFIX,
  separator: process.env.RBAC_SEPARATOR,
}));
