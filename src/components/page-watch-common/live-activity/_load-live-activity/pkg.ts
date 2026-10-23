import type * as PolyvRollingLotteryUIPkg from '@polyv/rolling-lottery-ui';
import type * as PolyvShakePkUIPkg from '@polyv/shake-pk-ui';

export type LiveActivityUIPkgRelations = {
  'rolling-lottery-ui': typeof PolyvRollingLotteryUIPkg;
  'shake-pk-ui': typeof PolyvShakePkUIPkg;
};

export type LiveActivityUIType = keyof LiveActivityUIPkgRelations;

export type LiveActivityUIPkg<T extends LiveActivityUIType> = LiveActivityUIPkgRelations[T];

declare global {
  interface Window {
    PolyvUIRollingLottery?: typeof PolyvRollingLotteryUIPkg;
    PolyvUIShakePk?: typeof PolyvShakePkUIPkg;
  }
}
