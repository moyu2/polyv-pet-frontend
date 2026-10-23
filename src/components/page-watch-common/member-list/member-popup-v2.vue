<template>
  <pwc-popup
    v-model="visible"
    :title="$lang('member.list.onlineUser')"
    fill-body
    height="512px"
    :closeable="false"
  >
    <template #header-right>
      <span
        class="c-member-list-popup-v2__header__rule"
        @click="showRulePopup"
      >
        {{ $lang('member.list.rule') }}
      </span>
    </template>
    <div class="c-member-list-popup-v2__content">
      <polyv-member-list
        v-if="refreshKey"
        :key="refreshKey"
        ref="memberListRef"
        :show-top="false"
      />
    </div>
  </pwc-popup>
</template>

<script setup lang="ts">
import { appEvents, useEventBusListener } from '@/app/app-events';
import { getChatUIV2Pkg } from '@/plugins/external-lib-loaders/load-chat-ui-v2';
import { ComponentInstance, PwcPopup, useSimpleVisible } from '@polyv/vue-components';
import type { MemberList } from '@polyv/chat-ui';
import { ref } from 'vue';

const PolyvChatUI = getChatUIV2Pkg();

const { MemberList: PolyvMemberList } = PolyvChatUI;

const { visible, show } = useSimpleVisible();

const refreshKey = ref<number>();

useEventBusListener(appEvents.portrait.OpenPortraitOnlineUserListPopup, () => {
  refreshKey.value = Date.now();
  show();
});

const memberListRef = ref<ComponentInstance<typeof MemberList>>();

function showRulePopup() {
  memberListRef.value?.openRulePopup();
}
</script>

<style lang="scss">
.c-member-list-popup-v2__header__rule {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
}

.c-member-list-popup-v2__content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  .plv-online-item {
    padding: 0;
  }
}
</style>
