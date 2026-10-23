<!-- @file PC 端副屏收起控件 -->
<template>
  <div class="c-pc-watch-sub-pack-up">
    <div
      v-if="subScreenPackUp"
      class="c-pc-watch-sub-pack-up__placeholder pws-pc-sub-pack-up-placeholder"
    >
      <template v-if="mainScreen === MainScreenContent.Doc">
        <span
          v-if="liveStatus === LiveStatus.Live"
          class="c-pc-watch-sub-pack-up__placeholder__dot"
        ></span>
        <span class="g-singleline">{{ nickname }}({{ actor }})</span>
      </template>
    </div>
    <div
      class="c-pc-watch-sub-pack-up__btn"
      :class="{
        'c-pc-watch-sub-pack-up__btn--active': subScreenPackUp,
      }"
      @click="onClickBtn"
    >
      <pc-icon-arrow-up class="c-pc-watch-sub-pack-up__btn__icon" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PcIconArrowUp } from '@/components/component-icons/pc/map';
import { useChannelStore } from '@/store/use-channel-store';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { storeToRefs } from 'pinia';
import { computed, unref } from 'vue';
import { LiveStatus, MainScreenContent } from '@polyv/live-watch-sdk';

const layoutStore = useLayoutStore();
const { subScreenPackUp, mainScreen } = storeToRefs(layoutStore);

const channelStore = useChannelStore();
const { teacherInfo, liveStatus } = storeToRefs(channelStore);

const connectMicStore = useConnectMicStore();

function onClickBtn() {
  layoutStore.$patch({
    subScreenPackUp: !layoutStore.subScreenPackUp,
  });
}

const nickname = computed(() => {
  if (connectMicStore.masterNickname) {
    return connectMicStore.masterNickname;
  }
  return unref(teacherInfo)?.nick;
});

const actor = computed(() => {
  if (connectMicStore.masterActor) {
    return connectMicStore.masterActor;
  }
  return unref(teacherInfo)?.actor;
});
</script>

<style lang="scss">
.c-pc-watch-sub-pack-up {
  border-radius: inherit;
}
.c-pc-watch-sub-pack-up__placeholder {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  padding-right: 40px;
  padding-left: 16px;
  font-size: 14px;
  pointer-events: initial;
  border-radius: inherit;
}
.c-pc-watch-sub-pack-up__placeholder__dot {
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  margin-right: 8px;
  background: #5bffcc;
  border-radius: 50%;
}

.c-pc-watch-sub-pack-up__btn {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  line-height: 1;
  color: $--color-white;
  pointer-events: initial;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  transition: 0.3s;

  &.c-pc-watch-sub-pack-up__btn--active {
    transform: rotateZ(180deg);
  }
}
.c-pc-watch-sub-pack-up__btn__icon {
  display: flex;
  font-size: 24px;
}
</style>
