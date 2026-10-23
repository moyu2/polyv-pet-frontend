<!-- @file PC 端输入栏更多面板 -->
<template>
  <div class="c-pc-chat-input-controller__more-panel pws-pc-more-panel">
    <!-- 只看我和讲师 -->
    <div
      v-if="onlySpecialMsgWidgetVisible"
      class="c-pc-chat-input-controller__more-panel__item pws-pc-more-panel-item"
      @click="onClickSpecialMsg"
    >
      <pc-form-checkbox :checked="onlySpecialMsg">
        {{ $lang('chat.onlyHost') }}
      </pc-form-checkbox>
    </div>

    <!-- 屏蔽特效 -->
    <div
      v-if="showDonateGifts"
      class="c-pc-chat-input-controller__more-panel__item pws-pc-more-panel-item"
      @click="toggleDonateAnimationVisible"
    >
      <pc-form-checkbox :checked="!donateAnimationVisible">
        {{ $lang('donate.hideAnimation') }}
      </pc-form-checkbox>
    </div>

    <!-- 设置昵称 -->
    <div
      v-if="canSetNick"
      class="c-pc-chat-input-controller__more-panel__item pws-pc-more-panel-item"
      @click="onClickSetNick"
    >
      <pc-icon-set-nick class="c-pc-chat-input-controller__more-panel__icon" />
      {{ $lang('chat.setNick') }}
    </div>

    <!-- 绑定手机号 -->
    <div
      v-if="bindMobileVisible"
      class="c-pc-chat-input-controller__more-panel__item pws-pc-more-panel-item"
      @click="onClickBindMobile"
    >
      <pc-icon-bind-mobile class="c-pc-chat-input-controller__more-panel__icon" />
      {{ $lang('identityInfo.bindMobile') }}
    </div>

    <!-- 文件管理 -->
    <div
      class="c-pc-chat-input-controller__more-panel__item pws-pc-more-panel-item"
      @click="onClickFileManagement"
    >
      <pc-icon-more-files class="c-pc-chat-input-controller__more-panel__icon" />
      {{ $lang('fileManagement.title') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { emitFunc } from '@polyv/vue-components';
import PcFormCheckbox from '@/components/common-base/form/form-checkbox/pc-form-checkbox.vue';
import {
  PcIconSetNick,
  PcIconBindMobile,
  PcIconMoreFiles,
} from '@/components/component-icons/pc/map';
import { useDonateAnimationVisible } from '@/components/page-watch-common/donate/donate-animation/use-donate-animation';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';
import { useDonateStore } from '@/store/use-donate-store';
import { useIdentityStore } from '@/store/use-identity-store';
import { useViewerStore } from '@/store/use-viewer-store';
import { storeToRefs } from 'pinia';
import { useInterruptUserClick } from '@/hooks/business/use-interrupt-user-click/use-interrupt-user-click';

const emit = defineEmits({
  /** 关闭 */
  close: emitFunc<void>(),
});

const { getEmitter } = useGlobalInject();

const donateStore = useDonateStore();
const { showDonateGifts } = storeToRefs(donateStore);
const { donateAnimationVisible, toggleDonateAnimationVisible } = useDonateAnimationVisible();

const chatStore = useChatStore();
const { onlySpecialMsg, onlySpecialMsgWidgetVisible } = storeToRefs(chatStore);

const { canSetNick } = storeDefinitionToRefs(useViewerStore);

const { bindMobileVisible } = storeDefinitionToRefs(useIdentityStore);

const { toInterruptUserClick } = useInterruptUserClick();

function onClickSpecialMsg() {
  chatStore.toggleOnlySpecialMsg();
}

function onClickSetNick() {
  const result = toInterruptUserClick({ triggerSource: 'set-nick', ignoreSetNick: false });
  if (result) {
    return;
  }

  getEmitter().emit(appEvents.chat.OpenSetNick, true);
  emit('close');
}

function onClickBindMobile() {
  getEmitter().emit(appEvents.global.OpenBindIdentityInfoDialog);
  emit('close');
}

/** 点击文件管理 */
function onClickFileManagement() {
  getEmitter().emit(appEvents.global.OpenFileManagement, true);
  emit('close');
}
</script>

<style lang="scss">
.c-pc-chat-input-controller__more-panel {
  box-sizing: border-box;
  width: 140px;
  padding: 0 16px;
}

.c-pc-chat-input-controller__more-panel__item {
  display: flex;
  align-items: center;
  height: 40px;
  line-height: 40px;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    color: #78a7ed;
  }
}

.c-pc-chat-input-controller__more-panel__icon {
  display: flex;
  margin-right: 6px;
  font-size: 16px !important;
}
</style>
