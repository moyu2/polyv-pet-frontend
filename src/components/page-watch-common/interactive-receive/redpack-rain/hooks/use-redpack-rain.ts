import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { computed, ref } from 'vue';
import { useRedpackStatus } from '../../redpack/hooks/use-redpack';
import { RedpackStatusData } from '../types/redpack-rain-types';

/**
 * @hook 互动-红包雨
 * */
export const useRedpackRain = () => {
  const { getEmitter, getWatchCore } = useGlobalInject();

  const interactReceiveStore = useInteractReceiveStore();

  const watchCore = getWatchCore();
  /** 红包雨 SDK 实例 */
  const redpackRainSdk = watchCore.interactReceive.getRedpackRain();

  /** 自定义红包雨皮肤 */
  const customImgConfig = computed(() => {
    const interactSetting = interactReceiveStore.interactSetting;
    return {
      rainThemeBottomBgImg: interactSetting.redpackRainBottomImage,
      rainThemeBollImgArray: interactSetting.redpackRainImages,
    };
  });

  /** 红包雨组件实例 */
  const redpackRainRef = ref();

  /**
   * 打开红包雨
   * @param data 红包雨数据
   * @param source 打开来源，默认：msg
   */
  const openRedpackRain = (data: UniversalParams, source = 'msg') => {
    if (!redpackRainRef.value) {
      console.warn('openRedpackRain fail, redpackRainRef is undefined');
      return;
    }

    redpackRainRef.value.showRedpackRain({
      ...data,
      source,
    });
  };

  useEventBusListener(appEvents.interaction.OpenRedpackRain, openRedpackRain);

  const { setRedpackStatus } = useRedpackStatus();

  /** 处理红包雨状态改变 */
  const onStateChange = (data: RedpackStatusData) => {
    const { redpackId, state } = data;
    setRedpackStatus(redpackId, state);
  };

  /** 处理红包雨显示状态改变 */
  const onVisibleChange = (visible = false) => {
    interactReceiveStore.isGoOnRedpackRain = !!visible;
  };

  /** 处理点击提现按钮 */
  const onClickWithdraw = () => {
    getEmitter().emit(appEvents.withdraw.OpenWithdrawApply, true);
  };

  /** 处理点击积分记录 */
  const onClickScoreRecord = () => {
    getEmitter().emit(appEvents.interaction.OpenScoreRecord, true);
  };

  return {
    redpackRainSdk,
    customImgConfig,
    redpackRainRef,
    openRedpackRain,
    onStateChange,
    onVisibleChange,
    onClickWithdraw,
    onClickScoreRecord,
  };
};
