<!-- PC 端聊天室输入框 -->
<template>
  <div class="c-pc-chat-message-input">
    <chat-message-input-section>
      <!-- 图标左侧 -->
      <template #icon-left-suffix>
        <!-- 公告 -->
        <pc-bulletin-entrance />
        <!-- 打赏 -->
        <pc-donate-entrance />
        <!-- 我的奖励 -->
        <pc-personal-reward-entrance />
      </template>

      <!-- 更多面板 -->
      <template #more-panel>
        <!-- 设置昵称 -->
        <chat-message-input-secion-more-item
          v-if="canSetNick"
          class="c-pc-chat-message-input__set-nick"
          :icon="PcIconEditNickname"
          :label="$lang('chat.setNick')"
          @click="onClickSetNick"
        />

        <!-- 绑定手机号 -->
        <chat-message-input-secion-more-item
          v-if="bindMobileVisible"
          class="c-pc-chat-message-input__bind-mobile"
          :icon="PcIconBindMobile"
          :label="$lang('identityInfo.bindMobile')"
          @click="onClickBindMobile"
        />

        <!-- 文件管理 -->
        <chat-message-input-secion-more-item
          class="c-pc-chat-message-input__file-management"
          :icon="PcIconMoreFilesTwo"
          :label="$lang('fileManagement.title')"
          @click="onClickFileManagement"
        />
      </template>
    </chat-message-input-section>
  </div>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import {
  PcIconBindMobile,
  PcIconEditNickname,
  PcIconMoreFilesTwo,
} from '@/components/component-icons/pc/map';
import PcDonateEntrance from '@/components/page-watch-common/donate/donate-entrance/pc-donate-entrance.vue';
import PcBulletinEntrance from '@/components/page-watch-common/interactive-receive-v2/bulletin-v2/bulletin-entrance/pc-bulletin-entrance.vue';
import PcPersonalRewardEntrance from '@/components/page-watch-common/personal-reward/pc-personal-reward-entrance.vue';
import { getChatUIV2Pkg } from '@/plugins/external-lib-loaders/load-chat-ui-v2';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useIdentityStore } from '@/store/use-identity-store';
import { useViewerStore } from '@/store/use-viewer-store';

const { getEmitter } = useGlobalInject();
const PolyvChatUI = getChatUIV2Pkg();
const { ChatMessageInputSection, ChatMessageInputSecionMoreItem } = PolyvChatUI;

// 设置昵称
const { canSetNick } = storeDefinitionToRefs(useViewerStore);
function onClickSetNick() {
  getEmitter().emit(appEvents.chat.OpenSetNick, true);
}

// 绑定手机号
const { bindMobileVisible } = storeDefinitionToRefs(useIdentityStore);
function onClickBindMobile() {
  getEmitter().emit(appEvents.global.OpenBindIdentityInfoDialog);
}

// 文件管理
function onClickFileManagement() {
  getEmitter().emit(appEvents.global.OpenFileManagement, true);
}
</script>

<style lang="scss">
.c-pc-chat-message-input {
  position: relative;
  z-index: 10;
  padding: 6px;
}
.c-pc-chat-message-input__set-nick {
  order: 40;
}

.c-pc-chat-message-input__bind-mobile {
  order: 50;
}

.c-pc-chat-message-input__file-management {
  order: 60;
}
</style>
