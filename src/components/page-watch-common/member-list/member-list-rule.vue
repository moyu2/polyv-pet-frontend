<!-- @file 移动端在线用户列表-规则页 -->
<template>
  <mobile-popup
    :visible.sync="popupVisible"
    :content-height="512"
    class="c-member-list-rule"
    :title="$lang('member.popup.title')"
    :backable="isPortraitWatchLayout"
    back-auto-close
    :closable="!isPortraitWatchLayout"
    ignore-content-max-height
    :content-percent-height="0.784"
  >
    <div class="c-member-list-rule__item">
      <div class="c-member-list-rule__title">{{ $lang('member.list.rule.one') }}</div>
      <div class="c-member-list-rule__desc">
        {{ $lang('member.list.rule.text1') }}
      </div>
    </div>
    <div class="c-member-list-rule__item">
      <div class="c-member-list-rule__title">{{ $lang('member.list.rule.two') }}</div>
      <div class="c-member-list-rule__desc">
        {{ $lang('member.list.rule.text2') }}
      </div>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { appEvents, useEventBusListener } from '@/app/app-events';
import { useMemberListHook } from './use-member-list';

const { isPortraitWatchLayout } = useMemberListHook();

const popupVisible = ref(false);

useEventBusListener(appEvents.portrait.OpenPortraitOnlineUserListRulePopup, async () => {
  popupVisible.value = true;
});
</script>

<style lang="scss">
.c-member-list-rule {
  .c-mobile-popup__header {
    border-bottom: none;
  }
  .c-mobile-popup__header__title {
    font-size: 16px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.8);
    text-align: center;
  }
  .c-mobile-popup__body {
    padding: 12px 16px 0;
  }
}
.c-member-list-rule__item:last-child {
  margin-top: 32px;
}

.c-member-list-rule__title {
  font-size: 16px;
  font-weight: 500;
  line-height: normal;
  color: rgba(0, 0, 0, 0.8);
}

.c-member-list-rule__desc {
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.2;
  color: rgba(0, 0, 0, 0.6);
}
</style>
