<template>
  <div
    class="c-mobile-feed-layout-switch-entrance"
    @click="toNextFeedLayout"
  >
    <mobile-live-signal-icon class="c-mobile-feed-layout-switch-entrance__signal-icon" />
    <span>{{ $lang('feed.switchLayout.entrance.text') }}</span>
  </div>
</template>

<script setup lang="ts">
import { appEvents, useEventBusListener } from '@/app/app-events';
import MobileLiveSignalIcon from '@/components/common-business/live-signal-icon/mobile-live-signal-icon.vue';
import { usePlayerAction } from '@/components/page-watch-common/player/hooks/use-player-action';
import { useFeedInjectStore } from '@/store/use-feed-inject-store';
import { usePlayerStore } from '@/store/use-player-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { PlayStatus } from '@polyv/live-watch-sdk';

const feedInjectStore = useFeedInjectStore();
const playerStore = usePlayerStore();
const watchAppStore = useWatchAppStore();
const { toPlay } = usePlayerAction();

function toEnterSecondFeedLayout() {
  if (feedInjectStore.inSecondFeedLayout) return;

  watchAppStore.getEmitter().emit(appEvents.global.FeedLayoutLevelChange, {
    from: 0,
    to: 1,
  });

  feedInjectStore.switchFeedLayout(1);

  if (!watchAppStore.isLiveWatchConnected) {
    watchAppStore.recoverActivePageConnect();
    return;
  }

  watchAppStore.getSocket()?.connect();
}

function toNextFeedLayout() {
  if (playerStore.playStatus !== PlayStatus.Playing) {
    toPlay();
  }

  if (feedInjectStore.inFirstFeedLayout) {
    toEnterSecondFeedLayout();
    return;
  }

  console.warn('当前组件只处理从第一层到第二层的逻辑');
  // if (feedInjectStore.inSecondFeedLayout) {
  //   watchAppStore.getEmitter().emit(appEvents.global.FeedLayoutLevelChange, {
  //     from: 1,
  //     to: 0,
  //   });

  //   feedInjectStore.switchFeedLayout(0);
  //   watchAppStore.getSocket()?.disconnect();
  // }
}

useEventBusListener(appEvents.global.EnterSecondFeedLayout, toEnterSecondFeedLayout);
</script>

<style lang="scss">
.c-mobile-feed-layout-switch-entrance {
  box-sizing: border-box;
  width: fit-content;
  min-width: 154px;
  height: 36px;
  padding: 0 16px;
  font-size: 14px;
  line-height: 36px;
  text-align: center;

  background: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 28px;
}

.c-mobile-feed-layout-switch-entrance__signal-icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
}
</style>
