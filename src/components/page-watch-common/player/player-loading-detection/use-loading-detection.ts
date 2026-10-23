import { ref, watch } from 'vue';
import { useWebPageFullscreen } from '@/components/page-watch-common/player/hooks/use-web-page-fullscreen';
import { usePlayerStore } from '@/store/use-player-store';
import {
  PlayerLoadingDetectionType,
  PlayerDetectionCbParams,
  PlayerDetectionSwitchType,
  QualityLevelType,
} from '@polyv/live-watch-sdk';
import { translate } from '@/assets/lang';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';
import { usePlayerControl } from '@/components/page-watch-common/player/hooks/use-player-control';

export enum LoadingDetectionTipsType {
  /** 等待切换 */
  WAIT_TO_SWITCH = 'waitToSwitch',
  /** 切换中 */
  SWITCHING = 'switching',
  /** 切换成功 */
  SUCCESS = 'success',
}

export const useLoadingDetection = () => {
  const { getWatchCore } = useMultiPolyvWatchApp();
  const watchCore = getWatchCore();
  const playerStore = usePlayerStore();
  const { filterQualityText } = usePlayerControl();

  /** 是否显示缓冲播放不佳提示 */
  const visible = ref<boolean>(false);

  /** 切换提示类型 */
  const tipsType = ref<LoadingDetectionTipsType>(LoadingDetectionTipsType.WAIT_TO_SWITCH);

  /** 切换建议文案 */
  const switchSuggestionText = ref('');

  /** 缓冲播放切换建议文案 */
  const currentSuggestionText = ref('');

  /** 是否需要显示切换成功反馈提示 */
  let waitToShowSuccessCallback = false;

  /** 保存显示信息 */
  const recordDetectionInfo = ref<PlayerDetectionCbParams | null>(null);

  const { isMobileWebPageFullscreen } = useWebPageFullscreen();

  /**
   * 执行缓冲播放不佳提示建议
   */
  function executeLoadingDetection() {
    waitToShowSuccessCallback = true;
    tipsType.value = LoadingDetectionTipsType.SWITCHING;

    const detailInfo = playerStore.playerLoadingDetectionInfo.detail;
    if (detailInfo) {
      watchCore.player.switchDetectionByInfo(detailInfo);
    }
  }

  /**
   * 缓冲播放不佳提示显示处理
   */
  function detectionShowHandler(info: PlayerDetectionCbParams) {
    visible.value = true;
    tipsType.value = LoadingDetectionTipsType.WAIT_TO_SWITCH;
    recordDetectionInfo.value = info;

    const { detail } = info;
    if (!detail) {
      return;
    }

    const { type } = detail;

    const switchText =
      type === PlayerDetectionSwitchType.LINE
        ? translate('player.line')
        : translate('player.quality');
    switchSuggestionText.value = translate('player.loading.detection.wait').replace(
      '$1',
      switchText,
    );
  }

  /**
   * 缓冲播放不佳提示隐藏处理
   */
  function detectionHideHandler() {
    visible.value = false;
  }

  /**
   * 缓冲播放不佳提示切换中处理
   */
  function detectionSuccessHandler() {
    tipsType.value = LoadingDetectionTipsType.SUCCESS;
    waitToShowSuccessCallback = false;

    const { detail } = recordDetectionInfo.value || {};

    if (!detail) {
      return;
    }
    const { type, index } = detail;
    if (type === PlayerDetectionSwitchType.HD) {
      const levelTypes = [QualityLevelType.sd, QualityLevelType.hd, QualityLevelType.fhd];
      const levelType = levelTypes[index];
      currentSuggestionText.value = filterQualityText(levelType);
      return;
    }

    switchSuggestionText.value = `${translate('player.line')}${index + 1}`;
  }

  watch(
    () => playerStore.playerLoadingDetectionInfo,
    info => {
      if (!info) {
        return;
      }

      const { type } = info;

      if (type === PlayerLoadingDetectionType.SHOW) {
        detectionShowHandler(info);
      }

      if (type === PlayerLoadingDetectionType.HIDE) {
        detectionHideHandler();
      }

      if (type === PlayerLoadingDetectionType.SUCCESS && waitToShowSuccessCallback) {
        detectionSuccessHandler();
      }
    },
  );

  return {
    visible,
    tipsType,
    isMobileWebPageFullscreen,
    switchSuggestionText,
    currentSuggestionText,

    executeLoadingDetection,
  };
};
