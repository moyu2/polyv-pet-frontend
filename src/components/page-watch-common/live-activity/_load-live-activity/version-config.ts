import { SdkLoaderEnv } from '@polyv/live-watch-sdk';
import type { LiveActivityUIType } from './pkg';

interface LiveActivityUIVersion {
  [SdkLoaderEnv.Prod]: string;
  [SdkLoaderEnv.Rc]: string;
  [SdkLoaderEnv.Test]: string;
  globalVariable: 'PolyvUIRollingLottery' | 'PolyvUIShakePk';
}

export const liveActivityUIVersions: Record<LiveActivityUIType, LiveActivityUIVersion> = {
  'rolling-lottery-ui': {
    [SdkLoaderEnv.Prod]: 'rc-20260827',
    [SdkLoaderEnv.Rc]: 'dev-20260827',
    [SdkLoaderEnv.Test]: 'dev-20260827',
    globalVariable: 'PolyvUIRollingLottery',
  },
  'shake-pk-ui': {
    [SdkLoaderEnv.Prod]: 'rc-20260827',
    [SdkLoaderEnv.Rc]: 'dev-20260827',
    [SdkLoaderEnv.Test]: 'dev-20260827',
    globalVariable: 'PolyvUIShakePk',
  },
};
