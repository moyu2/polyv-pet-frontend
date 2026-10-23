<!-- @file 竖屏-在线用户列表 -->
<template>
  <mobile-popup
    :visible.sync="popupVisible"
    :theme="popupTheme"
    :content-height="512"
    class="c-portrait-member-list"
    :show-header="false"
    :title="translate('menu.tabName.invite')"
    ignore-content-max-height
    :content-percent-height="0.784"
  >
    <div class="c-portrait-member-list__header">
      <div>{{ $lang('member.list.onlineUser') }}</div>
      <div
        class="c-portrait-member-list__header__rule"
        @click="showRulePopup"
      >
        {{ $lang('member.list.rule') }}
      </div>
    </div>
    <member-list />
  </mobile-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import MemberList from './member-list.vue';
import { PopupTheme } from '@/components/common-base/popup/types';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { useMemberListHook } from './use-member-list';

import { translate } from '@/assets/lang';
import { useGlobalInject } from '@/app/use-global-inject';

const { getEmitter } = useGlobalInject();

const { startPollingOnlineUserList, stopPollingOnlineUserList } = useMemberListHook();

const popupVisible = ref(false);

function showRulePopup() {
  getEmitter().emit(appEvents.portrait.OpenPortraitOnlineUserListRulePopup);
}

watch(popupVisible, visible => {
  if (visible) {
    startPollingOnlineUserList();
  } else {
    stopPollingOnlineUserList();
  }
});

useEventBusListener(appEvents.portrait.OpenPortraitOnlineUserListPopup, () => {
  popupVisible.value = true;
});

const popupTheme = computed(() => {
  return PopupTheme.PortraitLight;
});
</script>

<style lang="scss">
.c-portrait-member-list {
  .c-mobile-popup__content {
    padding-top: 52px;
    border-radius: 16px 16px 0 0 !important;
  }
  .c-member-list__tips {
    color: rgba(0, 0, 0, 0.4);
  }
  .c-member-list-item__nick {
    color: rgba(0, 0, 0, 0.8);
  }
}

.c-portrait-member-list__header {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 52px;
  padding: 0 16px;
  padding: 15px 0;
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.8);
  text-align: center;
  background-color: #fff;
  border-radius: 16px 16px 0 0;
}

.c-portrait-member-list__header__rule {
  position: absolute;
  right: 16px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
}

.c-portrait-invite-rank__list__no-more-tips {
  padding: 12px 0;
  font-size: 14px;
  color: #999999;
  text-align: center;
}
</style>
