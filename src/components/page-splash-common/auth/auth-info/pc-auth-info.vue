<!-- @file PC 端观看条件：登记观看 -->
<template>
  <pc-dialog
    ref="dialogRef"
    class="c-pc-auth-info"
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    :width="580"
  >
    <!-- 填写表单 -->
    <pc-auth-info-form
      v-if="dialogModel === 'form'"
      ref="formRef"
      @close-dialog="closeDialog"
      @click-logined="openLogined"
    />
    <!-- 登录 -->
    <pc-auth-info-login
      v-else
      @close-dialog="closeDialog"
    />
  </pc-dialog>
</template>

<script setup lang="ts">
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import PcAuthInfoForm from './pc-auth-info-form.vue';
import PcAuthInfoLogin from './pc-auth-info-login.vue';
import { useAuthInfo } from './use-auth-info';

const { dialogVisible, dialogModel, dialogTitle, dialogRef, formRef, closeDialog, openLogined } =
  useAuthInfo();
</script>
