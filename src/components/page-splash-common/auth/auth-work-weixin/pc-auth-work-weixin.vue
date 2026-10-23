<!-- @file PC 端观看条件：企微授权 -->
<template>
  <pc-dialog
    class="c-pc-auth-work-weixin"
    :visible.sync="dialogVisible"
    :title="$lang('auth.workWeixin.title')"
  >
    <div
      id="wx_work_code"
      class="c-pc-auth-work-weixin__qrcode"
    >
      {{ $lang('auth.workWeixin.qrcodeLoading') }}...
    </div>
  </pc-dialog>
</template>

<script setup lang="ts">
import PcDialog from '@/components/common-base/dialog/pc-dialog/pc-dialog.vue';
import { useAuthWorkWeixinPc } from './use-auth-work-weixin';

const { dialogVisible } = useAuthWorkWeixinPc();
</script>

<style lang="scss">
.c-pc-auth-work-weixin__qrcode {
  display: flex;
  justify-content: center;
  height: 300px;
  margin-top: 10px;
  overflow: hidden;
}
</style>
