/** 授权目标对象类型 */
export const MandateTargets = [
  { value: 'user', name: '用户' },
  { value: 'role', name: '角色' },
  { value: 'group', name: '用户组' },
  { value: 'department', name: '部门' },
];

/** 授权目标对象类型 */
export const enum MandateTargetType {
  USER = 'user',
  ROLE = 'role',
  GROUP = 'group',
  DEPARTMENT = 'department',
}
