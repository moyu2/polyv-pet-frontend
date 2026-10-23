<template>
  <div
    v-show="buttonVisible"
    class="c-mobile-auth-button"
  >
    <normal-button
      class="c-mobile-auth-button__btn"
      :size="ButtonSize.Medium"
      block
      :text="buttonText"
      @click="onClickAuthButton"
    />

    <!-- 无条件观看/公开观看 -->
    <mobile-auth-none v-if="currentAuthType === AuthType.None" />
    <!-- 白名单观看 -->
    <mobile-auth-phone v-if="currentAuthType === AuthType.Phone" />
    <!-- 付费观看 -->
    <mobile-auth-pay v-if="currentAuthType === AuthType.Pay" />
    <!-- 验证码观看 -->
    <mobile-auth-code v-if="currentAuthType === AuthType.Code" />
    <!-- 登记观看 -->
    <mobile-auth-info v-if="currentAuthType === AuthType.Info" />
    <!-- 自定义授权 -->
    <mobile-auth-custom v-if="currentAuthType === AuthType.Custom" />
    <!-- 外部授权 -->
    <mobile-auth-external v-if="currentAuthType === AuthType.External" />
    <!-- 企微授权 -->
    <mobile-auth-work-weixin v-if="currentAuthType === AuthType.EnterpriseWeChat" />
  </div>
</template>

<script setup lang="ts">
import { ButtonSize } from '@/components/common-base/normal-button/types';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import MobileAuthNone from '@/components/page-splash-common/auth/auth-none/auth-none.vue';
import MobileAuthPhone from '@/components/page-splash-common/auth/auth-phone/mobile-auth-phone.vue';
import MobileAuthPay from '@/components/page-splash-common/auth/auth-pay/mobile-auth-pay.vue';
import MobileAuthCode from '@/components/page-splash-common/auth/auth-code/mobile-auth-code.vue';
import MobileAuthInfo from '@/components/page-splash-common/auth/auth-info/mobile-auth-info.vue';
import MobileAuthCustom from '@/components/page-splash-common/auth/auth-custom/auth-custom.vue';
import MobileAuthExternal from '@/components/page-splash-common/auth/auth-external/auth-external.vue';
import MobileAuthWorkWeixin from '@/components/page-splash-common/auth/auth-work-weixin/mobile-auth-work-weixin.vue';

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

<style>
.c-mobile-auth-button {
  display: flex;
}
</style>
