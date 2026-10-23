<!-- @file PC 端连麦屏幕共享按钮 v2 -->
<template>
  <div
    ref="wrapRef"
    class="c-pc-connect-mic-screenshare-button-v2"
  >
    <!-- 共享中提示 -->
    <transition name="fade">
      <div
        v-show="screenShareInfo.isScreenSharing && tipsVisible"
        class="c-pc-connect-mic-screenshare-button-v2__tooltip"
      >
        {{ $lang('connectMic.screenshare.sharing') }}
      </div>
    </transition>

    <!-- 共享菜单（未共享时点击展开） -->
    <transition name="fade">
      <div
        v-show="menuVisible"
        class="c-pc-connect-mic-screenshare-button-v2__menu"
      >
        <div
          class="c-pc-connect-mic-screenshare-button-v2__menu-item"
          @click="onClickStart"
        >
          <img
            class="c-pc-connect-mic-screenshare-button-v2__menu-icon"
            :src="imgScreenshareStart"
            alt=""
          />
          <span>{{ $lang('connectMic.screenshare.startV2') }}</span>
        </div>
        <div
          class="c-pc-connect-mic-screenshare-button-v2__menu-item c-pc-connect-mic-screenshare-button-v2__menu-item--setting"
          @click="onClickSetting"
        >
          <img
            class="c-pc-connect-mic-screenshare-button-v2__menu-icon"
            :src="imgSetting"
            alt=""
          />
          <span>{{ $lang('connectMic.screenshare.settingTitle') }}</span>
        </div>
      </div>
    </transition>

    <!-- 按钮 -->
    <div
      class="c-pc-connect-mic-screenshare-button-v2__btn"
      @click="onClickButton"
      @mouseenter="tipsVisible = true"
      @mouseleave="tipsVisible = false"
    >
      <img
        class="c-pc-connect-mic-screenshare-button-v2__icon"
        :src="screenShareInfo.isScreenSharing ? imgScreenshareOff : imgScreenshare"
        alt=""
      />
    </div>

    <!-- 屏幕共享设置 -->
    <pc-screen-share-setting />

    <!-- 屏幕共享开启提示 -->
    <pc-screen-share-tips />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useClickOutside } from '@/hooks/behaviors/use-click-outside';
import { useConnectMicScreenShare } from '../hooks/use-connect-mic-screen-share';
import PcScreenShareSetting from '../pc-connect-mic/pc-connect-mic-sceenshare-setting.vue';
import PcScreenShareTips from '../pc-connect-mic/pc-connect-mic-screenshare-tips.vue';

import imgScreenshare from '../imgs/ic_screenshare.png';
import imgScreenshareOff from '../imgs/ic_screenshare_off.png';
import imgScreenshareStart from '../imgs/screenshare-start.png';
import imgSetting from '../imgs/setting.png';

const { screenShareInfo } = storeDefinitionToRefs(useConnectMicStore);

const { onClickStartScreenShare, stopScreenShare } = useConnectMicScreenShare();

const { getEmitter } = useGlobalInject();

const wrapRef = ref<HTMLDivElement>();

/** 共享菜单是否展开 */
const menuVisible = ref(false);

/** 共享中提示是否显示 */
const tipsVisible = ref(false);

useClickOutside(wrapRef, () => {
  menuVisible.value = false;
});

function onClickButton() {
  // 共享中：点击直接停止（与原先一致）
  if (screenShareInfo.value.isScreenSharing) {
    stopScreenShare();
    return;
  }
  menuVisible.value = !menuVisible.value;
}

function onClickStart() {
  menuVisible.value = false;
  onClickStartScreenShare();
}

function onClickSetting() {
  menuVisible.value = false;
  getEmitter().emit(appEvents.connectMic.OpenScreenShareSetting, true);
}
</script>

<style lang="scss">
.c-pc-connect-mic-screenshare-button-v2__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  font-size: 24px;
  color: $--color-white;
  cursor: pointer;
  user-select: none;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 50%;

  &:hover {
    background: rgba(0, 0, 0, 0.65);
  }
}

.c-pc-connect-mic-screenshare-button-v2__icon {
  width: 24px;
  height: 24px;
  pointer-events: none;
  user-select: none;
}

.c-pc-connect-mic-screenshare-button-v2__menu {
  position: absolute;
  bottom: calc(100% + 12px);
  left: 50%;
  z-index: 2;
  min-width: 200px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  transform: translateX(-50%);
}

.c-pc-connect-mic-screenshare-button-v2__menu-item {
  display: flex;
  gap: 10px;
  align-items: center;
  height: 36px;
  padding: 0 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  border-radius: 4px;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
}

.c-pc-connect-mic-screenshare-button-v2__menu-item--setting {
  > img {
    opacity: 0.6;
  }
}

.c-pc-connect-mic-screenshare-button-v2__menu-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  pointer-events: none;
  user-select: none;
}

.c-pc-connect-mic-screenshare-button-v2__tooltip {
  position: absolute;
  bottom: calc(100% + 12px);
  left: 50%;
  z-index: 2;
  padding: 6px 12px;
  font-size: 12px;
  line-height: 1;
  color: $--color-white;
  white-space: nowrap;
  background: rgba(40, 40, 44, 0.96);
  border-radius: 8px;
  transform: translateX(-50%);
}
</style>
