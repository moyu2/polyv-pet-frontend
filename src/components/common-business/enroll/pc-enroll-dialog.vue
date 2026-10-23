<!-- @file PC 端报名观看表单弹层 -->
<template>
  <pc-dialog
    class="c-pc-enroll-dialog"
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    ref="dialogInstance"
  >
    <!-- 报名观看表单填写 -->
    <pc-enroll-form
      v-if="dialogModel === 'form'"
      @click-cancel="redirectToEnrolled"
      @close-dialog="closeEnrollDialog"
    />
    <!-- 报名观看登录 -->
    <pc-enroll-login
      v-if="dialogModel === 'login'"
      @click-cancel="closeEnrollDialog"
      @redirect-to-enroll="redirectToEnroll"
      @close-dialog="closeEnrollDialog"
      @resize="resizeDialog"
    />
  </pc-dialog>
</template>

<script setup lang="ts">
import PcEnrollForm from './pc-enroll-form.vue';
import PcEnrollLogin from './pc-enroll-login.vue';

import { useEnrollDialog } from './hooks/use-enroll-dialog';
import PcDialog, { DialogInstance } from '@/components/common-base/dialog/pc-dialog';
import { nextTick, ref, watch } from 'vue';

const {
  dialogModel,
  dialogVisible,
  dialogTitle,
  enrollDialogInstance,
  closeEnrollDialog,
  redirectToEnroll,
  redirectToEnrolled,
} = useEnrollDialog();

const dialogInstance = ref<DialogInstance>();

watch(
  () => dialogModel.value,
  () => {
    resizeDialog();
  },
);

function resizeDialog() {
  nextTick(() => {
    dialogInstance.value?.resetPosition();
  });
}

defineExpose(enrollDialogInstance);
</script>
