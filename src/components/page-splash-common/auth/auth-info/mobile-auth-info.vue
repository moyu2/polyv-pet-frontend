<!-- @file 移动端观看条件：登记观看 -->
<template>
  <mobile-popup
    class="c-mobile-auth-info"
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    :width="580"
    :backable="dialogModel === 'login'"
    @click-back="openAuthInfoForm"
  >
    <mobile-auth-info-form
      v-if="dialogModel === 'form'"
      ref="formRef"
      @close-dialog="closeDialog"
      @click-logined="openLogined"
    />
    <mobile-auth-info-login
      v-else
      @close-dialog="closeDialog"
    />
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import MobileAuthInfoForm from './mobile-auth-info-form.vue';
import MobileAuthInfoLogin from './mobile-auth-info-login.vue';
import { useAuthInfo } from './use-auth-info';

const {
  dialogVisible,
  dialogModel,
  dialogTitle,
  formRef,
  closeDialog,
  openLogined,
  openAuthInfoForm,
} = useAuthInfo();
</script>
