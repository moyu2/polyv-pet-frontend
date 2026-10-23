/** @file 滚动抽奖 UMD 的 Watch 实例级全局注入。 */
import { defineComponent } from 'vue';
import { PropUtils } from '@polyv/vue-components';
import type { PolyvRollingLottery, PolyvShakePk } from '@polyv/live-watch-sdk';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLangStore } from '@/store/use-lang-store';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';
import { useGlobalInject } from '@/app/use-global-inject';
import { getRollingLotteryUI } from '../_load-live-activity';
import { getRollingLotteryUiController } from './use-rolling-lottery';

/** 滚动抽奖接收端全局注入。 */
export const RollingLotteryProvider = defineComponent({
  props: {
    rollingLotteryTarget: PropUtils.object<PolyvRollingLottery.RollingLottery>(),
    shakePkTarget: PropUtils.object<PolyvShakePk.ShakePk>(),
  },
  setup(props, { slots }) {
    const { getWatchCore } = useGlobalInject();
    const Pkg = getRollingLotteryUI();
    const uiController = getRollingLotteryUiController(getWatchCore(), Pkg);
    const { currentLang } = storeDefinitionToRefs(useLangStore);
    const { toInterruptUserClick } = useInterruptUserClick();
    type LiveActivityEntryProvideOptions = Omit<
      Parameters<typeof Pkg.useRollingLotteryGlobalProvide>[0],
      'getRollingLotteryTarget'
    > & {
      getRollingLotteryTarget: () => PolyvRollingLottery.RollingLottery | undefined;
      getShakePkTarget: () => PolyvShakePk.ShakePk | undefined;
    };
    const provideLiveActivityEntryTargets = Pkg.useRollingLotteryGlobalProvide as unknown as (
      options: LiveActivityEntryProvideOptions,
    ) => void;

    // The shared entrance can be initialized before the independently loaded lottery target.
    provideLiveActivityEntryTargets({
      getRollingLotteryTarget: () =>
        props.rollingLotteryTarget as PolyvRollingLottery.RollingLottery | undefined,
      getShakePkTarget: () => props.shakePkTarget as PolyvShakePk.ShakePk | undefined,
      uiController,
      locale: () => currentLang.value,
      beforeOpenReceive: () => {
        return !toInterruptUserClick({
          triggerSource: 'rolling-lottery',
          ignoreSetNick: true,
        });
      },
      translate: (key, params) => {
        return Pkg.createRollingLotteryTranslate(currentLang.value)(key, params);
      },
    });

    return () => slots.default?.();
  },
});
