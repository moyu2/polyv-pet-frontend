import { useQueryParams } from '@/hooks/core/use-query-params';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { usePortraitLayoutStore } from './use-portrait-layout-store';
import { WxShareConfigInfo } from '@/hooks/platform/use-weixin/types';

/**
 * feed inject 相关的 store 处理
 */
export const useFeedInjectStore = defineStore('feed-inject', () => {
  const { appendQueryParam, paramGetter } = useQueryParams();

  const portraitLayoutStore = usePortraitLayoutStore();

  /**
   * 目前只有两层，feedLayoutLevel = 0 表示第一层
   */
  const feedLayoutLevel = ref(Number(paramGetter().feedLayoutLevel() || 0));

  /**
   * 是否处于第一层
   * 第一层只有基础数据和视频数据
   */
  const inFirstFeedLayout = computed(() => {
    return feedLayoutLevel.value === 0;
  });

  /**
   * 是否处于第二层
   * 第二层才会连接聊天室和三分屏
   */
  const inSecondFeedLayout = computed(() => {
    return feedLayoutLevel.value === 1;
  });

  function setInitCarouselActiveIndex() {
    if (inFirstFeedLayout.value) {
      portraitLayoutStore.$patch({
        carouselActiveIndex: 0,
      });
    } else {
      portraitLayoutStore.$patch({
        carouselActiveIndex: 1,
      });
    }
  }

  function switchFeedLayout(layoutLevel: 0 | 1) {
    console.warn('switchFeedLayout', layoutLevel);
    if (feedLayoutLevel.value === layoutLevel) return;

    feedLayoutLevel.value = layoutLevel;
    appendQueryParam({
      feedLayoutLevel: String(feedLayoutLevel.value),
    });

    setTimeout(() => {
      setInitCarouselActiveIndex();
    }, 300);
  }

  const feedWxShareInfo = ref<WxShareConfigInfo>();

  return {
    feedLayoutLevel,

    inFirstFeedLayout,
    inSecondFeedLayout,

    setInitCarouselActiveIndex,
    switchFeedLayout,
    feedWxShareInfo,
  };
});
