import AlloyFinger from 'alloyfinger';
import { nextTick, ref, unref, watch } from 'vue';

import { useWindowResizeListener } from '@/hooks/core/use-window-resize-listener';
import { useAskStore } from '@/store/use-ask-store';
import { PortraitChatTabName, usePortraitLayoutStore } from '@/store/use-portrait-layout-store';
import { useWebviewStore } from '@/store/use-webview-store';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';

/**
 * 竖屏消息区轮播 hook
 */
export const useMessageCarousel = () => {
  const portraitLayoutStore = usePortraitLayoutStore();
  const askStore = useAskStore();
  const channelMenuStore = useChannelMenuStore();
  const webViewStore = useWebviewStore();

  const carouselRef = ref<{ $el: HTMLDivElement }>();

  const carouselHeight = ref(getCarouselHeight());

  /**
   * 获取轮播区域高度
   */
  function getCarouselHeight() {
    return document.documentElement.clientHeight * 0.24;
  }

  function resetCarouselHeight() {
    // 延迟 300 毫秒，确保页面布局已更新
    setTimeout(() => {
      carouselHeight.value = getCarouselHeight();
    }, 300);
  }

  const messageCarouselActiveIndex = ref(0);

  function getMessageCarouselList() {
    const list: PortraitChatTabName[] = [];

    if (channelMenuStore.chatMenuData.visible) {
      list.push(PortraitChatTabName.Chat);
    }
    if (channelMenuStore.askMenuData.visible) {
      list.push(PortraitChatTabName.Ask);
    }
    return list;
  }

  watch(
    () => unref(messageCarouselActiveIndex),
    () => {
      let currentName = PortraitChatTabName.Chat;
      const carouselList = getMessageCarouselList();
      currentName = carouselList[unref(messageCarouselActiveIndex)];

      if (!currentName && carouselList.length) {
        currentName = carouselList[0];
      }
      portraitLayoutStore.$patch({
        portraitMessageTabCurrentName: currentName,
      });

      if (currentName === PortraitChatTabName.Ask) {
        askStore.$patch({
          askReminderVisible: false,
        });
      }
    },
    {
      immediate: true,
    },
  );

  watch(
    () => portraitLayoutStore.portraitMessageTabCurrentName,
    () => {
      let index = 0;
      const carouselList = getMessageCarouselList();
      index = carouselList.indexOf(portraitLayoutStore.portraitMessageTabCurrentName);

      if (index !== -1 && index !== messageCarouselActiveIndex.value) {
        messageCarouselActiveIndex.value = index;
      }
    },
  );

  const handleTouchStart = (event: TouchEvent) => {
    event.stopPropagation();
  };

  const handleTouchMove = (event: TouchEvent) => {
    event.stopPropagation();
  };

  const handleTouchEnd = (event: TouchEvent) => {
    event.stopPropagation();
  };

  watch(
    () => carouselRef.value,
    async () => {
      await nextTick();
      const $carouselRef = carouselRef.value;
      if ($carouselRef && $carouselRef.$el) {
        new AlloyFinger($carouselRef?.$el as HTMLDivElement, {
          touchStart: handleTouchStart,
          touchEnd: handleTouchEnd,
          touchMove: handleTouchMove,
        });
      }
    },
    {
      immediate: true,
    },
  );

  useWindowResizeListener(
    () => {
      resetCarouselHeight();
    },
    {
      autoListen: true,
    },
  );

  if (webViewStore.isPlvWebview) {
    watch(
      () => webViewStore.isSmallWindow,
      () => {
        if (!webViewStore.isSmallWindow) {
          resetCarouselHeight();
        }
      },
    );
  }

  function onMessageCarouselSlidePrevEnd() {
    portraitLayoutStore.switchToBlankCarouselScreen();
  }

  return {
    carouselRef,
    carouselHeight,
    messageCarouselActiveIndex,

    onMessageCarouselSlidePrevEnd,
  };
};
