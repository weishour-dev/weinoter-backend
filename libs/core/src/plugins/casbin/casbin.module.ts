import { Module, Global, DynamicModule } from '@nestjs/common';
import { CasbinModuleOptions } from './casbin.interface';
import { CASBIN_MODULE_OPTIONS, CASBIN_ENFORCER } from './casbin.constants';
import { CasbinGuard } from './casbin.guard';
import { CasbinManagementService, CasbinRbacService, CasbinService } from '@weishour/core/services';
import { newEnforcer } from 'casbin';

@Global()
@Module({})
export class CasbinModule {
  static register(options: CasbinModuleOptions): DynamicModule {
    if (options.enablePossession === undefined) {
      options.enablePossession = true;
    }

    const moduleOptionsProvider = {
      provide: CASBIN_MODULE_OPTIONS,
      useValue: options || {},
    };

    let enforcerProvider = options.enforcerProvider;
    const importsModule = options.imports || [];

    if (!enforcerProvider) {
      if (!options.model || !options.policy) {
        throw new Error('必须提供一个enforcerProvider，或同时提供模型和策略');
      }

      enforcerProvider = {
        provide: CASBIN_ENFORCER,
        useFactory: async () => {
          const isFile = typeof options.policy === 'string';

          let policyOption;

          if (isFile) {
            policyOption = options.policy as string;
          } else {
            policyOption = await options.policy;
          }

          return newEnforcer(options.model, policyOption);
        },
      };
    }

    return {
      module: CasbinModule,
      providers: [
        moduleOptionsProvider,
        enforcerProvider,
        CasbinGuard,
        CasbinManagementService,
        CasbinRbacService,
        CasbinService,
      ],
      imports: importsModule,
      exports: [
        moduleOptionsProvider,
        enforcerProvider,
        CasbinGuard,
        CasbinManagementService,
        CasbinRbacService,
        CasbinService,
      ],
    };
  }
}
