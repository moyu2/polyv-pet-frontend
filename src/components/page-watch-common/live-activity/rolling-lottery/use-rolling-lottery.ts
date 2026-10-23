import { useGlobalInject } from '@/app/use-global-inject';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useLiveActivityStore } from '@/store/use-live-activity-store';
import type * as PolyvRollingLotteryUIPkg from '@polyv/rolling-lottery-ui';
import { useLiveActivityTarget } from '../_hooks/use-live-activity-target';

const rollingLotteryUiControllers = new WeakMap<
  object,
  PolyvRollingLotteryUIPkg.RollingLotteryUiController
>();

export function getRollingLotteryUiController(
  watchCore: object,
  Pkg: typeof PolyvRollingLotteryUIPkg,
) {
  let controller = rollingLotteryUiControllers.get(watchCore);
  if (!controller) {
    controller = Pkg.createRollingLotteryUiController();
    rollingLotteryUiControllers.set(watchCore, controller);
  }
  return controller;
}

export const useRollingLotteryTarget = () => {
  const { getWatchCore } = useGlobalInject();
  const { rollingLotteryLoaded } = storeDefinitionToRefs(useLiveActivityStore);
  const watchCore = getWatchCore();

  const { targetInited, getLiveActivityTarget } = useLiveActivityTarget(rollingLotteryLoaded, () =>
    watchCore.liveActivity.getRollingLotteryTarget(),
  );

  return {
    targetInited,
    getRollingLotteryTarget: getLiveActivityTarget,
  };
};
