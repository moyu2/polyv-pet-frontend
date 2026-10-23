<!-- @file 移动端引导页底部按钮 -->
<template>
  <div class="c-mobile-splash-btn pws-normal-button-primary--config-wrapper">
    <!-- 观看条件 -->
    <div
      v-if="!isAuthorized"
      class="c-mobile-splash-btn__auth"
    >
      <mobile-auth />
    </div>
    <!-- 报名观看 -->
    <div
      v-else-if="needEnrollByEnter"
      class="c-mobile-splash-btn__enroll"
    >
      <mobile-enroll />
    </div>
    <div v-else-if="forceSplashPage">
      <mobile-auth />
    </div>
  </div>
</template>

<script setup lang="ts">
import MobileAuth from '@/components/page-splash-common/auth/mobile-auth.vue';
import MobileEnroll from '@/components/common-business/enroll/mobile-enroll.vue';
import { useLoginReturnAuthPopup } from '@/components/page-splash-common/hooks/use-login-return-auth-popup';
import { useAuthStore } from '@/store/use-auth-store';
import { useEnrollStore } from '@/store/use-enroll-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useWatchAppStore } from '@/store/use-watch-app-store';

const { isAuthorized } = storeDefinitionToRefs(useAuthStore);

const { forceSplashPage } = storeDefinitionToRefs(useWatchAppStore);

const { needEnrollByEnter } = storeDefinitionToRefs(useEnrollStore);

useLoginReturnAuthPopup();
</script>
