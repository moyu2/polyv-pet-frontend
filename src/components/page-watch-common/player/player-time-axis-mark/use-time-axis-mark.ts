import { onBeforeMount, onMounted, ref } from 'vue';
import { PlayerEvents, PlayerEventsRelations, TimeAxisMarkInfo } from '@polyv/live-watch-sdk';

import { usePlayerAction } from '../hooks/use-player-action';
import cloneDeep from 'lodash-es/cloneDeep';
import { useGlobalInject } from '@/app/use-global-inject';
import { useResizeObserver } from '@/hooks/tools/use-resize-observer';

/** 打点信息合并列表项 */
export interface TimeAxisMarkMergedListItem {
  id: string;
  details: TimeAxisMarkInfo[];
}

export const useTimeAxisMarkHook = (hookOptions?: {
  getContainerWidth: () => number;
  getContainerEl: () => HTMLElement;
}) => {
  const { getWatchCore } = useGlobalInject();

  const { getContainerWidth = () => 0, getContainerEl = () => null } = hookOptions || {};

  const timeAxisMarkList = ref<TimeAxisMarkInfo[]>([]);

  const mergeTimeAxisMarkList = ref<TimeAxisMarkMergedListItem[]>([]);

  let __containerWidth = 0;

  function __getComputedContainerWidth() {
    const propContainerWidth = getContainerWidth();
    if (propContainerWidth !== 0) {
      __containerWidth = propContainerWidth;
    }
    return __containerWidth;
  }

  /**
   * 获取标记点第一个详情数据
   */
  function getFirstMarkPointDetail(markPoint?: TimeAxisMarkMergedListItem) {
    if (!markPoint || markPoint.details.length === 0) {
      throw new Error('获取标记点第一个详情数据失败');
    }

    return markPoint.details[0];
  }

  let timeAxisMarkObserver: ResizeObserver | null = null;

  function syncTimeAxisMarkInfo(
    params: PlayerEventsRelations[PlayerEvents.PlayerTimeAxisMarkListChange],
  ) {
    timeAxisMarkList.value = params.timeAxisMarkList;
    mergeTimeAxisMarkList.value = getMergeTimeAxisMarkList(
      params.timeAxisMarkList,
      __getComputedContainerWidth(),
    );

    const containerEl = getContainerEl();

    if (containerEl && containerEl.clientWidth === 0) {
      const { observer } = useResizeObserver(
        ref(containerEl),
        () => {
          if (containerEl.clientWidth > 0) {
            syncTimeAxisMarkInfo({
              timeAxisMarkList: timeAxisMarkList.value,
            });

            observer.disconnect();
          }
        },
        {
          autoLifeCycle: false,
        },
      );

      if (timeAxisMarkObserver) {
        timeAxisMarkObserver.disconnect();
      }
      timeAxisMarkObserver = observer;
    }
  }

  const { toSeekVideo } = usePlayerAction();

  function toSeekByTimeAxisMark(timeAxisMark: TimeAxisMarkInfo) {
    toSeekVideo(timeAxisMark.markTime);
  }

  onMounted(() => {
    const watchCore = getWatchCore();
    watchCore.player.eventEmitter.on(
      PlayerEvents.PlayerTimeAxisMarkListChange,
      syncTimeAxisMarkInfo,
    );
  });

  onBeforeMount(() => {
    const watchCore = getWatchCore();
    watchCore.player.eventEmitter.off(
      PlayerEvents.PlayerTimeAxisMarkListChange,
      syncTimeAxisMarkInfo,
    );

    if (timeAxisMarkObserver) {
      timeAxisMarkObserver.disconnect();
    }
  });

  return {
    timeAxisMarkList,
    mergeTimeAxisMarkList,

    getFirstMarkPointDetail,
    toSeekByTimeAxisMark,
  };
};

/**
 * 将相近的点位合并到一起
 * @type 纯工具函数
 */
function getMergeTimeAxisMarkList(
  timeAxisMarkList: TimeAxisMarkInfo[],
  width: number,
  interval = 16,
): TimeAxisMarkMergedListItem[] {
  if (!timeAxisMarkList) return [];
  if (width === 0) return [];

  const result: TimeAxisMarkMergedListItem[] = [];
  let prevLeft = 0;

  cloneDeep(timeAxisMarkList).forEach(timeAxisMark => {
    const prevData = result[result.length - 1];

    if (!prevData) {
      result.push({
        id: timeAxisMark.id,
        details: [timeAxisMark],
      });
      prevLeft = width * timeAxisMark.percents;
      return;
    }

    const currentLeft = width * timeAxisMark.percents;
    if (currentLeft - prevLeft < interval) {
      prevData.id = prevData.id + timeAxisMark.id;
      prevData.details.push(timeAxisMark);
    } else {
      result.push({
        id: timeAxisMark.id,
        details: [timeAxisMark],
      });
      prevLeft = currentLeft;
    }
  });

  return result;
}
