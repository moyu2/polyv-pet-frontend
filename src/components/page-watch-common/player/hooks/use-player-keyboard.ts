import { isFocusActiveForm } from '@/assets/utils/dom';
import { useLayoutStore } from '@/store/use-layout-store';
import { usePlaybackStore } from '@/store/use-playback-store';
import { onBeforeUnmount, onMounted, ref, Ref, watchEffect } from 'vue';
import { usePlayerAction } from './use-player-action';
import { MainScreenContent, WarmUpType } from '@polyv/live-watch-sdk';
import { KeyCodeMap } from '@/assets/constants/key-code';
import { usePlayerStore } from '@/store/use-player-store';

/** 副作用元素收集数组 */
let _effectElements: Array<Ref<HTMLElement | undefined>> = [];

/** 收集需要响应播放器键盘事件的元素 */
export const collectPlayerKeyboardEffectElements = (el: Ref<HTMLElement | undefined>) => {
  _effectElements.push(el);
};

/**
 * PC 端播放器键盘按键 hook
 */
export const usePlayerKeyboard = (playerContainer: Ref<HTMLDivElement | undefined>) => {
  collectPlayerKeyboardEffectElements(playerContainer);

  const {
    toTogglePlayInLimit,
    toForwardVideoInLimit,
    toBackOffVideoInLimit,
    toIncreaseVolume,
    toReductionVolume,
  } = usePlayerAction();

  const playerStore = usePlayerStore();
  const playbackStore = usePlaybackStore();
  const layoutStore = useLayoutStore();

  /** 焦点是否在副作用元素 */
  const isFocusOnEffectEl = ref(false);

  watchEffect(() => {
    const canPlayWarmVideo = playerStore.warmUpSetting.warmUpType === WarmUpType.Video;
    if (playbackStore.isPlaybacking || canPlayWarmVideo) {
      listenKeydownEvent();
    } else {
      removeListenKeydownEvent();
    }
  });

  onMounted(() => {
    window.addEventListener(
      'click',
      event => {
        const targetElement = event.target as HTMLElement;
        const isContainTarget = _effectElements.find(el => el.value?.contains(targetElement));
        isFocusOnEffectEl.value = !!isContainTarget;
      },
      true,
    );
  });

  onBeforeUnmount(() => {
    removeListenKeydownEvent();
    _effectElements = [];
  });

  /** 监听键盘事件 */
  function listenKeydownEvent() {
    removeListenKeydownEvent();
    window.addEventListener('keydown', onKeydownEvent, false);
  }

  /** 移除键盘事件监听 */
  function removeListenKeydownEvent() {
    window.removeEventListener('keydown', onKeydownEvent, false);
  }

  /** 处理键盘事件 */
  function onKeydownEvent(event: KeyboardEvent) {
    // 没有聚焦在副作用元素 || 当前存在被聚焦的输入框
    if (!isFocusOnEffectEl.value || isFocusActiveForm()) {
      return;
    }

    /** 当前按键 */
    const keyCode = event.keyCode;
    /** 文档是否处于主屏 */
    const docInMainScreen = layoutStore.mainScreen === MainScreenContent.Doc;

    // 空格键：播放暂停
    if (keyCode === KeyCodeMap.Space) {
      event.preventDefault();
      toTogglePlayInLimit();
      return;
    }

    // 右箭头：控制视频前进
    if (keyCode === KeyCodeMap.ArrowRight && !docInMainScreen) {
      event.preventDefault();
      toForwardVideoInLimit();
      return;
    }

    // 左箭头：控制视频后退
    if (keyCode === KeyCodeMap.ArrowLeft && !docInMainScreen) {
      event.preventDefault();
      toBackOffVideoInLimit();
      return;
    }

    // 上箭头：控制音量递增
    if (keyCode === KeyCodeMap.ArrowUp && !docInMainScreen) {
      event.preventDefault();
      toIncreaseVolume();
      return;
    }

    // 下箭头：控制音量递减
    if (keyCode === KeyCodeMap.ArrowDown && !docInMainScreen) {
      event.preventDefault();
      toReductionVolume();
    }
  }
};
