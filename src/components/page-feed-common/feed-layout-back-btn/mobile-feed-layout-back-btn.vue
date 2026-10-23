<template>
  <div
    class="c-mobile-feed-layout-back-btn"
    @click="toBackFeedLayout"
  >
    <mobile-icon-arrow-left />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { MobileIconArrowLeft } from '@/components/component-icons/mobile/map';
import { useFeedInjectStore } from '@/store/use-feed-inject-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';

const feedInjectStore = useFeedInjectStore();
const watchAppStore = useWatchAppStore();

const clickEnabled = ref(true);

function toEnterFirstFeedLayout() {
  if (feedInjectStore.inFirstFeedLayout) return;

  watchAppStore.getEmitter().emit(appEvents.global.FeedLayoutLevelChange, {
    from: 1,
    to: 0,
  });

  feedInjectStore.switchFeedLayout(0);
  watchAppStore.getSocket()?.disconnect();
}

function toBackFeedLayout() {
  if (!clickEnabled.value) {
    watchAppStore.getEmitter().emit(appEvents.global.PageSlideForbidden);
    return;
  }

  if (feedInjectStore.inSecondFeedLayout) {
    toEnterFirstFeedLayout();
    return;
  }

  if (feedInjectStore.inFirstFeedLayout) {
    watchAppStore.getEmitter().emit(appEvents.global.FeedLayoutLevelChange, {
      from: 0,
      to: -1,
    });
  }
}

useEventBusListener(appEvents.global.PageToLockDrag, () => {
  clickEnabled.value = false;
});

useEventBusListener(appEvents.global.PageToUnlockDrag, () => {
  clickEnabled.value = true;
});

useEventBusListener(appEvents.global.EnterFirstFeedLayout, toEnterFirstFeedLayout);
</script>

<style lang="scss">
.c-mobile-feed-layout-back-btn {
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  font-size: 28px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 100%;
}
</style>
