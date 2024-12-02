import { ExecutionContext, Provider, DynamicModule, ForwardReference, Type, ModuleMetadata } from '@nestjs/common';
import { CasbinActionVerb, CasbinPossession, CustomCasbinActionVerb, CasbinResource, CasbinUser } from './casbin.enum';

export interface CasbinModuleOptions<T = any> {
  model?: string;
  policy?: string | Promise<T>;
  enablePossession?: boolean;
  userFromContext?: (context: ExecutionContext) => CasbinUser;
  enforcerProvider?: Provider<any>;
  // 导出此模块中所需提供程序的导入模块的可选列表
  imports?: Array<Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference>;
}

export interface CasbinModuleOptionsFactory {
  createCasbinOptions(): Promise<CasbinModuleOptions> | CasbinModuleOptions;
}

export interface CasbinModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<CasbinModuleOptionsFactory>;
  useClass?: Type<CasbinModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<CasbinModuleOptions> | CasbinModuleOptions;
  inject?: any[];
  extraProviders?: Provider[];
}

export interface CasbinPermission {
  resource: CasbinResource;
  action: CasbinActionVerb | CustomCasbinActionVerb;
  possession?: CasbinPossession;
  isOwn?: (ctx: ExecutionContext) => boolean;
}

export interface WsPermission {
  action?: string;
  type?: string;
  adminAllow?: boolean;
}
