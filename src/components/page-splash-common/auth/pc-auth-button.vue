<template>
  <div
    v-show="buttonVisible"
    class="c-pc-auth-button"
  >
    <normal-button
      class="c-pc-auth-button__btn"
      :size="ButtonSize.Medium"
      :text="buttonText"
      @click="onClickAuthButton"
      data-testid="pc-auth-button"
    />

    <!-- 无条件观看/公开观看 -->
    <pc-auth-none v-if="currentAuthType === AuthType.None" />
    <!-- 白名单观看 -->
    <pc-auth-phone v-if="currentAuthType === AuthType.Phone" />
    <!-- 付费观看 -->
    <pc-auth-pay v-if="currentAuthType === AuthType.Pay" />
    <!-- 验证码观看 -->
    <pc-auth-code v-if="currentAuthType === AuthType.Code" />
    <!-- 登记观看 -->
    <pc-auth-info v-if="currentAuthType === AuthType.Info" />
    <!-- 自定义授权 -->
    <pc-auth-custom v-if="currentAuthType === AuthType.Custom" />
    <!-- 外部授权 -->
    <pc-auth-external v-if="currentAuthType === AuthType.External" />
    <!-- 企微授权 -->
    <pc-auth-work-weixin v-if="currentAuthType === AuthType.EnterpriseWeChat" />
  </div>
</template>

<script setup lang="ts">
import { ButtonSize } from '@/components/common-base/normal-button/types';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import PcAuthNone from '@/components/page-splash-common/auth/auth-none/auth-none.vue';
import PcAuthPhone from '@/components/page-splash-common/auth/auth-phone/pc-auth-phone.vue';
import PcAuthPay from '@/components/page-splash-common/auth/auth-pay/pc-auth-pay.vue';
import PcAuthCode from '@/components/page-splash-common/auth/auth-code/pc-auth-code.vue';
import PcAuthInfo from '@/components/page-splash-common/auth/auth-info/pc-auth-info.vue';
import PcAuthCustom from '@/components/page-splash-common/auth/auth-custom/auth-custom.vue';
import PcAuthExternal from '@/components/page-splash-common/auth/auth-external/auth-external.vue';
import PcAuthWorkWeixin from '@/components/page-splash-common/auth/auth-work-weixin/pc-auth-work-weixin.vue';

import { AuthType } from '@polyv/live-watch-sdk';

import {
  authButtonProps,
  useAuthButton,
} from '@/components/page-splash-common/auth/hooks/use-auth-button';

const props = defineProps(authButtonProps());

const { buttonText, buttonVisible, currentAuthType, onClickAuthButton } = useAuthButton({
  props,
});
</script>

<style lang="scss">
.c-pc-auth-button {
  display: flex;
  flex-direction: column;
}
.c-pc-auth-button__btn {
  width: 184px;
}
</style>
