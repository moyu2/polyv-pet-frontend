<!-- @file 移动端横屏-云席侧边挂件 -->

<template>
  <div
    v-if="isMeetingSeatTableTemplate"
    v-show="!mobileChatInputFixedVisible"
    class="c-mobile-seat-table-pendant"
    :class="{
      'c-mobile-seat-table-pendant--close': !visible,
    }"
  >
    <template v-if="visible">
      <!-- 发言 -->
      <div
        v-if="chatInputControllerEnable && chatMenuData.visible"
        class="c-mobile-seat-table-pendant__item"
        @click="onClickChat"
      >
        <mobile-icon-chat class="c-mobile-seat-table-pendant__item__icon" />
        <span class="c-mobile-seat-table-pendant__item__text">{{ $lang('seatTable.chat') }}</span>
      </div>

      <!-- 邀请 -->
      <div
        v-if="isWeixin && invitePosterEnabled"
        class="c-mobile-seat-table-pendant__item"
        @click="onClickInvitePosterEntry"
      >
        <mobile-icon-share class="c-mobile-seat-table-pendant__item__icon" />
        <span class="c-mobile-seat-table-pendant__item__text">{{ $lang('seatTable.invite') }}</span>
      </div>

      <!-- 我的 -->
      <div
        class="c-mobile-seat-table-pendant__item"
        @click="onClickMe"
      >
        <mobile-icon-me class="c-mobile-seat-table-pendant__item__icon" />
        <span class="c-mobile-seat-table-pendant__item__text">{{ $lang('seatTable.me') }}</span>
      </div>
    </template>

    <div
      class="c-mobile-seat-table-pendant__pack-up"
      @click="toggle"
    >
      <mobile-icon-pack-up class="c-mobile-seat-table-pendant__pack-up__icon" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import { isWeixin } from '@/assets/utils/browser';
import {
  MobileIconChat,
  MobileIconMe,
  MobileIconPackUp,
  MobileIconShare,
} from '@/components/component-icons/mobile/map';
import { useSimpleVisible } from '@/hooks/behaviors/use-simple-visible';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useInviteStore } from '@/store/use-invite-store';
import { useChannelMenuStore } from '@/store/use-channel-menu-store';
import { useChatStore } from '@/store/use-chat-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';
import { useGlobalInject } from '@/app/use-global-inject';
import { useInvitePosterEntry } from '@/components/page-watch-common/invite/hooks/use-invite-poster-entry';

const { chatInputControllerEnable, mobileChatInputFixedVisible } =
  storeDefinitionToRefs(useChatStore);

const { chatMenuData } = storeDefinitionToRefs(useChannelMenuStore);

const { invitePosterEnabled } = storeDefinitionToRefs(useInviteStore);

const { isMeetingSeatTableTemplate } = storeDefinitionToRefs(useInteractReceiveStore);

const { visible, toggle } = useSimpleVisible(true);

const { getEmitter } = useGlobalInject();

const { onClickInvitePosterEntry } = useInvitePosterEntry();

function onClickMe() {
  getEmitter().emit(appEvents.interaction.OpenSeatTableFollowerPopup, true);
}

function onClickChat() {
  getEmitter().emit(appEvents.chat.ShowMobileFixedChatInput);
}
</script>

<style lang="scss">
.c-mobile-seat-table-pendant {
  z-index: 10;
  width: 36px;
  padding-top: 17px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;

  &.c-mobile-seat-table-pendant--close {
    height: 36px;
    padding-top: 0;
    overflow: hidden;
    transition: all 0.3s ease;
  }
}

.c-mobile-seat-table-pendant__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  & + & {
    margin-top: 12px;
  }
}

.c-mobile-seat-table-pendant__item__icon {
  margin-bottom: 2px;
  font-size: 24px;
  color: #333;
}
.c-mobile-seat-table-pendant__item__text {
  font-size: 12px;
  color: #999;
}

.c-mobile-seat-table-pendant__item + .c-mobile-seat-table-pendant__pack-up {
  margin-top: 4px;
}

.c-mobile-seat-table-pendant__pack-up {
  display: flex;
  align-items: center;
  justify-content: center;
  width: $pendant-size;
  height: $pendant-size;
  font-size: 16px;
  color: #333;
}
.c-mobile-seat-table-pendant__pack-up__icon {
  display: flex;
}
</style>
