import { useGlobalInject } from '@/app/use-global-inject';
import { useLiveActivityStore } from '@/store/use-live-activity-store';
import { onBeforeUnmount } from 'vue';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

/**
 * 直播活动 SDK 初始化
 */
export const useLiveActivitySetup = () => {
  const { getWatchCore } = useGlobalInject();
  const watchCore = getWatchCore();
  const liveActivityStore = useLiveActivityStore();

  let setupPromise: Promise<void> | undefined;
  let liveActivityRewardSubscribed = false;
  let shakePkRewardSubscribed = false;
  let active = true;
  const targetUnsubscribes: Array<() => void> = [];

  async function setupLiveActivityRewardStatus() {
    const target = await watchCore.liveActivity.getRollingLotteryTarget();
    if (!active) {
      return;
    }
    const currentState = target.getState();
    if (!liveActivityRewardSubscribed) {
      const event = target.RollingLotteryEvent.HasRewardChanged;
      const handleHasRewardChanged = ({ hasReward }: { hasReward: boolean }) => {
        liveActivityStore.setLiveActivityRewardAvailable(hasReward);
      };
      target.eventEmitter.on(event, handleHasRewardChanged);
      targetUnsubscribes.push(() => {
        target.eventEmitter.off(event, handleHasRewardChanged);
      });
      liveActivityRewardSubscribed = true;
    }

    target
      .loadRewardRecords({ pageNumber: 1, pageSize: 1 })
      .catch(error => console.error('[live-activity] load rewards failed', error));

    liveActivityStore.setLiveActivityRewardAvailable(currentState.hasReward);
  }

  async function setupShakePkRewardStatus() {
    if (shakePkRewardSubscribed) {
      return;
    }
    const target = await watchCore.liveActivity.getShakePkTarget();
    if (!active || shakePkRewardSubscribed) {
      return;
    }
    const event = target.ShakePkEvent.Result;
    const handleResult = ({ isWinner }: { isWinner?: boolean }) => {
      if (!isWinner) {
        return;
      }
      // REWARD is directed to the winning viewer, so no personal-win refresh is needed here.
      liveActivityStore.setLiveActivityRewardAvailable(true);
    };
    target.eventEmitter.on(event, handleResult);
    targetUnsubscribes.push(() => {
      target.eventEmitter.off(event, handleResult);
    });
    shakePkRewardSubscribed = true;
  }

  async function setupLiveActivitiesInner() {
    liveActivityStore.setLiveActivityLoading(true);

    try {
      const tasks: Promise<boolean>[] = [];
      if (!liveActivityStore.rollingLotteryLoaded) {
        tasks.push(
          watchCore.liveActivity
            .getRollingLotteryTarget()
            .then(target => target.setup())
            .then(() => {
              liveActivityStore.setRollingLotteryLoaded(true);
              setupLiveActivityRewardStatus().catch(error => {
                console.error('[live-activity] setup reward status failed', error);
              });
              return true;
            })
            .catch(error => {
              liveActivityStore.setRollingLotteryLoaded(false, getErrorMessage(error));
              return false;
            }),
        );
      }
      if (!liveActivityStore.shakePkLoaded) {
        tasks.push(
          watchCore.liveActivity
            .getShakePkTarget()
            .then(target => target.setup())
            .then(() => {
              liveActivityStore.setShakePkLoaded(true);
              setupShakePkRewardStatus().catch(error => {
                console.error('[live-activity] setup shake PK reward status failed', error);
              });
              return true;
            })
            .catch(error => {
              liveActivityStore.setShakePkLoaded(false, getErrorMessage(error));
              return false;
            }),
        );
      }

      const results = await Promise.all(tasks);
      if (results.length && !results.some(Boolean) && !liveActivityStore.liveActivityLoaded) {
        throw new Error(liveActivityStore.liveActivityLoadError || 'live activity setup failed');
      }
    } catch (error) {
      const message = getErrorMessage(error);
      if (!liveActivityStore.rollingLotteryLoaded) {
        liveActivityStore.setRollingLotteryLoaded(false, message);
      }
      if (!liveActivityStore.shakePkLoaded) {
        liveActivityStore.setShakePkLoaded(false, message);
      }
      throw error;
    } finally {
      liveActivityStore.setLiveActivityLoading(false);
    }
  }

  function setupLiveActivities() {
    const rewardStatusTasks: Promise<void>[] = [];
    if (liveActivityStore.rollingLotteryLoaded && !liveActivityRewardSubscribed) {
      rewardStatusTasks.push(setupLiveActivityRewardStatus());
    }
    if (liveActivityStore.shakePkLoaded && !shakePkRewardSubscribed) {
      rewardStatusTasks.push(setupShakePkRewardStatus());
    }
    if (liveActivityStore.rollingLotteryLoaded && liveActivityStore.shakePkLoaded) {
      return Promise.all(rewardStatusTasks).then(() => undefined);
    }

    if (rewardStatusTasks.length) {
      Promise.all(rewardStatusTasks).catch(error => {
        console.error('[live-activity] restore reward status subscription failed', error);
      });
    }

    if (!setupPromise) {
      setupPromise = setupLiveActivitiesInner().finally(() => {
        setupPromise = undefined;
      });
    }

    return setupPromise;
  }

  onBeforeUnmount(() => {
    active = false;
    targetUnsubscribes.splice(0).forEach(unsubscribe => unsubscribe());
    liveActivityRewardSubscribed = false;
    shakePkRewardSubscribed = false;
  });

  return {
    setupLiveActivities,
  };
};
