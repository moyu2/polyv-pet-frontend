<!-- @file 移动端横屏-申请提现 -->
<template>
  <mobile-popup
    class="c-mobile-withdraw-apply"
    :title="$lang('withdraw.apply.popup.title')"
    :visible.sync="popupVisible"
    append-to-body
    backable
    hide-header-border
    content-background="#F5F5F6"
    @click-back="handleWithdrawApplyPopupBackClick"
  >
    <div class="c-mobile-withdraw-apply__container">
      <form-wrap
        :theme="FormTheme.White"
        :form-data="formData"
        :form-rules="formRules"
        :submit-action="handleSubmitForm"
      >
        <form-item form-field="amount">
          <form-number-input
            v-model="formData.amount"
            :input-title="$lang('withdraw.apply.amount')"
            :input-title-width="100"
            :placeholder="amountInputPlaceHolder"
            :clearabled="false"
          >
            <span
              slot="suffix"
              class="c-mobile-withdraw-apply__form-item__all-btn"
              @click="setMaxAmount"
            >
              {{ $lang('withdraw.apply.amount.all') }}
            </span>
          </form-number-input>
        </form-item>

        <form-item style="margin-bottom: 8px">
          <form-input
            disabled
            :input-title="$lang('withdraw.apply.username')"
            :input-title-width="100"
            :placeholder="nickname"
          />
        </form-item>

        <p
          class="c-mobile-withdraw-apply__tips"
          v-html="withdrawApplyTips"
        ></p>

        <div class="c-mobile-withdraw-apply__btn-wrap">
          <form-submit-button
            :size="ButtonSize.Medium"
            block
            :text="$lang('withdraw.apply.btn.text')"
          >
          </form-submit-button>
        </div>
      </form-wrap>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import FormInput from '@/components/common-base/form/form-input/form-input.vue';
import FormItem from '@/components/common-base/form/form-item.vue';
import FormNumberInput from '@/components/common-base/form/form-number-input/form-number-input.vue';
import FormSubmitButton from '@/components/common-base/form/form-submit-button.vue';
import FormWrap from '@/components/common-base/form/form-wrap.vue';
import { FormTheme } from '@/components/common-base/form/types/enums';
import { ButtonSize } from '@/components/common-base/normal-button/types';
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useViewerStore } from '@/store/use-viewer-store';

import { appEvents, useEventBusListener } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';
import { useToastManager } from '@/hooks/components/use-toast';
import { useWithdrawApplyHook } from '../_hooks/use-withdraw-apply';

const { toast } = useToastManager();

const { getEmitter } = useGlobalInject();

const { nickname } = storeDefinitionToRefs(useViewerStore);
const {
  formData,
  formRules,
  amountInputPlaceHolder,
  withdrawApplyTips,

  setMaxAmount,
  submitForm,

  initWithdrawApply,
  resetWithdrawApply,
} = useWithdrawApplyHook();

const popupVisible = ref(false);

useEventBusListener(appEvents.withdraw.OpenWithdrawApply, handleWithdrawApplyPopupVisible);

/** "申请提现"  OpenWithdrawApply 钩子 */
function handleWithdrawApplyPopupVisible(visible: boolean) {
  if (visible) {
    initWithdrawApply();
  } else {
    resetWithdrawApply();
  }
  popupVisible.value = visible;
}

/** "申请提现" 弹出层返回按钮点击钩子 */
function handleWithdrawApplyPopupBackClick() {
  handleWithdrawApplyPopupVisible(false);
}

/** "提现申请"钩子 */
async function handleSubmitForm() {
  try {
    await submitForm();
    // 需要先隐藏"提现详情"
    getEmitter().emit(appEvents.withdraw.OpenWithdrawDetail, false);
    handleWithdrawApplyPopupVisible(false);
  } catch (error) {
    toast.error((error as Error).message);
  }
}
</script>

<style lang="scss">
.c-mobile-withdraw-apply__container {
  position: relative;
  box-sizing: border-box;
  height: 100%;
  padding: 20px 24px 0 24px;
  overflow: hidden;

  .c-mobile-form-input__main {
    border-radius: 8px !important;
  }
}

.c-mobile-withdraw-apply__form-item__all-btn {
  position: absolute;
  top: 0;
  right: 16px;
  display: flex;
  align-items: center;
  height: 100%;
  font-size: 14px;
  color: #3082fe;
}

.c-mobile-withdraw-apply__tips {
  font-size: 14px;
  line-height: 22px;
  color: #666;
  span {
    color: #3082fe;
  }
}

.c-mobile-withdraw-apply__btn-wrap {
  box-sizing: border-box;
  width: 100%;
  padding: 0 24px 34px;
  margin-top: 40px;
  @include iphone-x-pb(20px);
}
</style>
