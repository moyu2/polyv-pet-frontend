/**
 * @file 弹幕 hook
 */
import { useGlobalInject } from '@/app/use-global-inject';
import { usePlayerStore } from '@/store/use-player-store';
import { BarrageTarget } from '@polyv/live-watch-sdk';
import { isRef, onBeforeUnmount, ref, Ref, unref, watch } from 'vue';

export const useBarrage = (
  options: {
    containerRef?: HTMLDivElement | Ref<HTMLDivElement | undefined>;
  } = {},
) => {
  const { getWatchCore } = useGlobalInject();

  const playerStore = usePlayerStore();
  const containerRef = isRef(options.containerRef)
    ? options.containerRef
    : ref(options.containerRef);
  let barrageTarget: BarrageTarget | undefined;

  /** 设置弹幕 */
  function setupBarrage(): void {
    destroyBarrage();

    const container = unref(containerRef);
    if (!container) {
      return;
    }

    const watchCore = getWatchCore();
    const { direction, percent } =
      playerStore.barrageLocationSetting[playerStore.currentBarrageLocationIndex];
    barrageTarget = watchCore.barrage.setupBarrage({
      container,
      speed: playerStore.barrageSpeed,
      size: playerStore.barrageSize,
      alpha: playerStore.barrageAlpha,
      areaDirection: direction,
      areaPercentage: percent,
    });
  }

  /** 销毁弹幕 */
  function destroyBarrage(): void {
    if (barrageTarget) {
      barrageTarget.destroyTarget();
      barrageTarget = undefined;
    }
  }

  /** 修改弹幕速度 */
  function changeBarrageSpeed(speed: number) {
    barrageTarget?.changeSpeed(speed);
  }

  /** 修改弹幕字号 */
  function changeBarrageSize(size: number) {
    barrageTarget?.changeSize(size);
  }

  /** 修改弹幕透明度 */
  function changeBarrageAlpha(alpha: number) {
    barrageTarget?.changeAlpha(alpha);
  }

  /** 修改弹幕位置 */
  function changeBarrageLocation(index: number) {
    barrageTarget?.changeLocation(index);
  }

  watch(
    () => playerStore.barrageSpeed,
    () => {
      changeBarrageSpeed(playerStore.barrageSpeed);
    },
    {
      immediate: true,
    },
  );

  watch(
    () => playerStore.barrageSize,
    () => {
      changeBarrageSize(playerStore.barrageSize);
    },
    {
      immediate: true,
    },
  );

  watch(
    () => playerStore.barrageAlpha,
    () => {
      changeBarrageAlpha(playerStore.barrageAlpha);
    },
    {
      immediate: true,
    },
  );

  watch(
    () => playerStore.currentBarrageLocationIndex,
    () => {
      changeBarrageLocation(playerStore.currentBarrageLocationIndex);
    },
    {
      immediate: true,
    },
  );

  watch(
    () => [playerStore.barrageSetting.barrageEnabled, playerStore.barrageShow, containerRef.value],
    () => {
      if (!playerStore.barrageSetting.barrageEnabled || !playerStore.barrageShow) {
        destroyBarrage();
        return;
      }

      setupBarrage();
    },
    {
      immediate: true,
    },
  );

  onBeforeUnmount(() => {
    destroyBarrage();
  });

  return {
    containerRef,
    setupBarrage,
    destroyBarrage,
  };
};
