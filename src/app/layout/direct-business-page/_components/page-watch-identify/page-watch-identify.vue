<!-- @file 用户体系登录页 -->
<template>
  <div class="p-watch-identify">
    <watch-identify-login-content
      v-show="pageVisible"
      :after-guest-auth-success="afterGuestAuthSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import WatchIdentifyLoginContent from '@/components/common-business/watch-identity/identity-login-dialog-render/watch-identify-login-content.vue';
import { useIdentityStore } from '@/store/use-identity-store';
import { useIdentityUIGlobalProvider } from '@/components/common-business/watch-identity/use-identify-ui-global-provider';

const identityStore = useIdentityStore();

const pageVisible = ref(true);

// 设置身份认证全局配置
useIdentityUIGlobalProvider();

async function afterGuestAuthSuccess() {
  // 处理游客已授权的情况，防止页面一直刷新
  if (identityStore.isGuest) {
    identityStore.resetGuest();
    return;
  }

  pageVisible.value = false;
  window.location.reload();
}
</script>

<style>
.p-watch-identify {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
}
</style>
