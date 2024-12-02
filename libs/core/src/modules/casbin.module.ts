import { Module } from '@nestjs/common';
import { CasbinModule, CASBIN_ENFORCER, WsCasbinRule } from '@weishour/core/plugins/casbin';
import { WsConfigService } from '@weishour/core/services';
import { newEnforcer } from 'casbin';
import TypeORMAdapter from '@weishour/core/plugins/typeorm-adapter';

@Module({
  imports: [
    CasbinModule.register({
      enforcerProvider: {
        provide: CASBIN_ENFORCER,
        useFactory: async (wsConfigService: WsConfigService) => {
          return newEnforcer(
            'casbin.conf',
            await TypeORMAdapter.newAdapter(wsConfigService.get('casbin'), {
              customCasbinRuleEntity: WsCasbinRule,
            }),
          );
        },
        inject: [WsConfigService],
      },
    }),
  ],
  exports: [CasbinModule],
})
export class WsCasbinModule {}
