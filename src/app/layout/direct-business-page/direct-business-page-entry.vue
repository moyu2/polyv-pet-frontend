<!-- @file 独立业务页面入口 -->
<template>
  <div class="p-direct-business-page">
    <page-watch-identify v-if="isWatchIdentifyPage" />
    <page-verify-sale-invite v-else-if="isVerifySaleInvitePage" />
    <page-invite-watch-auditing v-else-if="isInviteWatchAuditingPage" />
    <page-work-wechat-friend v-else-if="isWorkWechatFriendPage" />
    <page-session-select v-else-if="isSessionSelectPage" />
    <!-- 默认是错误页 -->
    <page-error-pc-default v-else-if="!isMobileErrorPage" />
    <page-error-mobile-default v-else />
  </div>
</template>

<script lang="ts" setup>
import PageWatchIdentify from './_components/page-watch-identify/page-watch-identify.vue';
import PageVerifySaleInvite from './_components/page-verify-sale-invite/page-verify-sale-invite.vue';
import PageInviteWatchAuditing from './_components/page-invite-watch-auditing/page-invite-watch-auditing.vue';
import PageWorkWechatFriend from './_components/page-work-wechat-friend/page-work-wechat-friend.vue';
import PageSessionSelect from './_components/page-session-select/page-session-select.vue';

import PageErrorPcDefault from './_components/page-error/page-error-pc-default.vue';
import PageErrorMobileDefault from './_components/page-error/page-error-mobile-default.vue';

import { isMobile, isMockPc } from '@/assets/utils/browser';
import { useDirectBusinessPage } from './use-direct-business-page';

/** 使用移动端的异常页面 */
const isMobileErrorPage = isMobile || isMockPc;

const {
  isWatchIdentifyPage,
  isVerifySaleInvitePage,
  isInviteWatchAuditingPage,
  isWorkWechatFriendPage,
  isSessionSelectPage,
} = useDirectBusinessPage();
</script>

<style>
.p-direct-business-page {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #fff;
}
</style>
