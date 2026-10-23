import cloneDeep from 'lodash-es/cloneDeep';
import { onBeforeUnmount, onMounted, ref, set, nextTick, Ref, computed, watch } from 'vue';

import {
  SubtitleRealTimeCC,
  SubtitleTranslate,
  SubtitleEvents,
  SubtitlesListItem,
  SubtitleSliceType,
  SubtitleSourceTranslateLanguage,
  PlayerEvents,
} from '@polyv/live-watch-sdk';

import { translate } from '@/assets/lang';
import { TAB_NAME_SUBTITLE } from '@/assets/constants/tab-name';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useSubtitleStore } from '@/store/use-subtitle-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { useGlobalInject } from '@/app/use-global-inject';
import { SubtitleSelectOptionItem } from './mobile-subtitle-select/use-subtitle-select';

import { useSubtitleDetached } from './use-subtitle-detached';
import { setSubtitleSettings } from './subtitle-settings-storage';

export const useSubtitleSelected = () => {
  const subtitleStore = useSubtitleStore();
  const { liveSubtitleSourceTranslateLanguage, subtitleDisplayMode } =
    storeDefinitionToRefs(useSubtitleStore);

  const subtitleTranslateSelected = ref<
    ['all' | 'source' | 'translate', SubtitleSourceTranslateLanguage | undefined]
  >([subtitleDisplayMode.value, liveSubtitleSourceTranslateLanguage.value]);

  watch(subtitleTranslateSelected, () => {
    const [type, lang] = subtitleTranslateSelected.value;
    // 更新显示模式
    subtitleStore.changeSubtitleDisplayMode(type);
    // 更新翻译语言
    if (lang && lang !== liveSubtitleSourceTranslateLanguage.value) {
      if (type !== 'source') {
        subtitleStore.changeLiveSubtitleSourceTranslateLanguage(lang);
      } else {
        // type 为 source, 本地存储翻译语言，但是不需要触发changeLiveSubtitleSourceTranslateLanguage
        setSubtitleSettings({ translateLanguage: lang });
      }
    }
  });

  watch(liveSubtitleSourceTranslateLanguage, newLang => {
    if (subtitleTranslateSelected.value[1] !== newLang) {
      subtitleTranslateSelected.value = [subtitleDisplayMode.value, newLang];
    }
  });

  // 监听 store 中的显示模式变化，同步到本地选择
  watch(subtitleDisplayMode, newMode => {
    if (subtitleTranslateSelected.value[0] !== newMode) {
      subtitleTranslateSelected.value = [newMode, liveSubtitleSourceTranslateLanguage.value];
    }
  });

  return {
    subtitleTranslateSelected,
  };
};

/**
 * 实时字幕列表 hook
 * @hook
 */
export const useSubtitle = (
  subtitleScroll: Ref<HTMLElement | undefined>,
  options?: {
    /** 滚动底部判断阈值 */
    scrollBottomThreshold?: number;
  },
) => {
  const { getWatchCore } = useGlobalInject();
  const watchCore = getWatchCore();
  const {
    liveSubtitleSourceLanguage,
    liveSubtitlesShow,
    liveSubtitleSourceTranslateLanguageOptions,
    liveSubtitleSourceLanguageOptions,
    subtitleDisplayNumber,
    subtitleDisplayNumberLimitEnabled,
  } = storeDefinitionToRefs(useSubtitleStore);

  const { subtitleTranslateSelected } = useSubtitleSelected();

  /** 可以选择的翻译选项 */
  const subtitleTranslateOptions = computed<SubtitleSelectOptionItem[]>(() => {
    return [
      {
        label: translate('subtitle.all'),
        value: 'all',
        children: liveSubtitleSourceTranslateLanguageOptions.value,
      },
      {
        label: translate('subtitle.source'),
        value: 'source',
        children: liveSubtitleSourceLanguageOptions.value,
      },
      {
        label: translate('subtitle.translate'),
        value: 'translate',
        children: liveSubtitleSourceTranslateLanguageOptions.value,
      },
    ];
  });

  const _translateDelay = 500;

  /** 临时的实时字幕 */
  const currentSubtitle = ref('');

  /** 所有的字幕历史 */
  const subtitleList = ref<SubtitlesListItem[]>([]);

  const isBottom = ref(true);

  const hasNewMessage = ref(false);

  watch(
    () => isBottom.value,
    val => {
      if (val) {
        hasNewMessage.value = false;
      }
    },
  );
  const { setDefaultSlots, scrollToBottomDetached, showDetachedWindow } = useSubtitleDetached();

  function addSubtitleListener() {
    if (showDetachedWindow.value) {
      const scrollEl = document.querySelector('.pc-subtitle-detached-dialog__content--scroll');
      if (!scrollEl) return;
      scrollEl.addEventListener('scroll', e => {
        const el = e.target as HTMLElement;
        const scrollEl = el.querySelector('.c-subtitle__scroll');
        if (scrollEl && scrollEl.clientHeight < el.offsetHeight) return;
        isBottom.value = el.scrollHeight - el.offsetHeight - el.scrollTop <= 70;
      });
      return;
    }

    if (!subtitleScroll.value) return;

    const threshold = options?.scrollBottomThreshold ?? 70;

    function handleScroll(e: Event) {
      const el = e.target as HTMLElement;
      const scrollEl = el.querySelector('.c-subtitle__scroll');
      if (scrollEl && scrollEl.clientHeight < el.offsetHeight) return;
      isBottom.value = el.scrollHeight - el.offsetHeight - el.scrollTop <= threshold;
    }

    subtitleScroll.value.addEventListener('scroll', handleScroll);

    // 返回清理函数
    return () => {
      subtitleScroll.value?.removeEventListener('scroll', handleScroll);
    };
  }

  function scrollToBottom(check = true) {
    if (!isBottom.value && check) return;
    // 变成异步任务，先让eventListener检查
    setTimeout(() => {
      if (showDetachedWindow.value) {
        scrollToBottomDetached();
        return;
      }
      if (!subtitleScroll.value) return;

      subtitleScroll.value.scrollTo(0, subtitleScroll.value.scrollHeight);
    }, 0);
  }

  function firstToSubtitle() {
    scrollToBottom(false);
    addSubtitleListener();
  }

  function spliceSubtitle() {
    let value = subtitleDisplayNumber.value;
    if (!subtitleDisplayNumberLimitEnabled.value || value < 1) return;
    if (currentSubtitle.value) {
      value++;
    }
    const num = subtitleList.value.length - value;
    if (num > 0) {
      subtitleList.value.splice(0, num);
    }
  }

  const { pcAsideTabCurrentName } = storeDefinitionToRefs(useLayoutStore);

  const { mobileMenuCurrentName } = storeDefinitionToRefs(useLayoutStore);

  const isScrollToBottom = ref(false);

  watch(
    () => pcAsideTabCurrentName.value,
    val => {
      if (!isScrollToBottom.value && val === TAB_NAME_SUBTITLE) {
        firstToSubtitle();
        isScrollToBottom.value = true;
      }
    },
  );

  watch(
    () => showDetachedWindow.value,
    val => {
      if (val) {
        nextTick(() => {
          firstToSubtitle();
          isScrollToBottom.value = true;
        });
      }
      nextTick(() => {
        scrollToBottom(false);
      });
    },
  );

  watch(
    () => mobileMenuCurrentName.value,
    val => {
      if (!isScrollToBottom.value && val === TAB_NAME_SUBTITLE) {
        firstToSubtitle();
        isScrollToBottom.value = true;
      }
    },
  );

  function getSubtitleList() {
    subtitleList.value = cloneDeep(watchCore.subtitle.getSubtitlesList());
    spliceSubtitle();
  }

  function onSubtitleRealTimeCC(data: SubtitleRealTimeCC) {
    if (data.sliceType === SubtitleSliceType.End) {
      currentSubtitle.value = '';
      const params: SubtitlesListItem = {
        index: data.index,
        [liveSubtitleSourceLanguage.value]: data.text,
      };
      subtitleList.value.push(params);
      spliceSubtitle();
    } else {
      currentSubtitle.value = data.text;
    }
    scrollToBottom();

    if (!isBottom.value) hasNewMessage.value = true;
  }

  function onSubtitleTranslate(data: SubtitleTranslate & { retryCount?: number }) {
    const { retryCount = 0 } = data;
    const index = subtitleList.value.findIndex(item => item.index === data.index);
    if (index >= 0) {
      set(subtitleList.value[index], data.language, data.result);
      scrollToBottom();
    } else {
      if (retryCount > 1) {
        return;
      }

      setTimeout(() => {
        onSubtitleTranslate({
          ...data,
          retryCount: retryCount + 1,
        });
      }, _translateDelay);
    }
  }

  function onResetSubtitleList() {
    subtitleList.value = [];
    isBottom.value = true;
  }

  function onSubtitleListForceSync() {
    getSubtitleList();
    scrollToBottom();
  }

  /**
   * 更新横屏移动端播放器实时字幕开关状态
   */
  function updateMobileSubtitleSkinShow() {
    const { getWatchCore } = useGlobalInject();
    const watchCore = getWatchCore();

    watchCore.player.eventEmitter.on(PlayerEvents.PlayerSetupPanelSkinInit, () => {
      watchCore.player.changeSubtitleSkinShow(true, liveSubtitlesShow.value);
    });
  }

  function bindSubtitleEvent() {
    watchCore.subtitle.eventEmitter.on(SubtitleEvents.SubtitleRealTimeCC, onSubtitleRealTimeCC);
    watchCore.subtitle.eventEmitter.on(SubtitleEvents.SubtitleTranslate, onSubtitleTranslate);
    watchCore.subtitle.eventEmitter.on(SubtitleEvents.SubtitleListReset, onResetSubtitleList);
    watchCore.subtitle.eventEmitter.on(
      SubtitleEvents.SubtitleListForceSync,
      onSubtitleListForceSync,
    );
  }

  function unbindSubtitleEvent() {
    watchCore.subtitle.eventEmitter.off(SubtitleEvents.SubtitleRealTimeCC, onSubtitleRealTimeCC);
    watchCore.subtitle.eventEmitter.off(SubtitleEvents.SubtitleTranslate, onSubtitleTranslate);
    watchCore.subtitle.eventEmitter.off(SubtitleEvents.SubtitleListReset, onResetSubtitleList);
    watchCore.subtitle.eventEmitter.off(
      SubtitleEvents.SubtitleListForceSync,
      onSubtitleListForceSync,
    );
  }

  onMounted(() => {
    // eslint-disable-next-line promise/prefer-await-to-then
    watchCore.subtitle.initSubtitleList().finally(() => {
      bindSubtitleEvent();
      getSubtitleList();
      nextTick(() => {
        // 设置默认的字幕容器
        setDefaultSlots(subtitleScroll.value);
        subtitleScroll.value?.scrollTo({
          top: subtitleScroll.value.offsetHeight,
        });
      });
    });
  });

  onBeforeUnmount(() => {
    unbindSubtitleEvent();
  });

  return {
    hasNewMessage,
    scrollToBottom,
    updateMobileSubtitleSkinShow,

    subtitleTranslateSelected,
    subtitleTranslateOptions,

    subtitleList,
    currentSubtitle,

    firstToSubtitle,
  };
};
