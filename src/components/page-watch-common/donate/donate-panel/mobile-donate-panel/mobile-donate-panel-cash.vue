<!-- @file 移动端打赏面板 - 现金打赏 -->
<template>
  <div class="c-mobile-donate-panel-cash">
    <div
      v-if="!hideHeader"
      class="c-mobile-donate-panel-cash__header pws-mobile-panel-header-title"
    >
      <mobile-icon-arrow-left
        class="c-mobile-donate-panel-cash__header__close pws-mobile-panel-header-close"
        @click="onClickBack"
      />
      <span>{{ $lang('donate.cashReward') }}</span>
    </div>

    <div
      v-show="!customVisible"
      class="c-mobile-donate-panel-cash__options"
    >
      <div
        v-for="(item, index) in donateCashQuickOptions"
        :key="index"
        class="c-mobile-donate-panel-cash__options__item pws-mobile-donate-panel-option"
        :class="{
          'is-active': item === Number(cashAmount),
        }"
        @click="onClickAmount(item)"
      >
        ￥{{ item }}
      </div>
    </div>

    <div
      v-show="!customVisible"
      class="c-mobile-donate-panel-cash__custom-btn pws-mobile-donate-cash-custom-cash"
      @click="onClickCustom"
    >
      {{ $lang('donate.custom2') }} >
    </div>

    <div
      v-show="customVisible"
      class="c-mobile-donate-panel-cash__custom"
    >
      <form-wrap :theme="FormTheme.FollowSkin">
        <form-item>
          <form-input
            v-model="cashAmount"
            :placeholder="$lang('donate.placeholder')"
            :input-title="$lang('donate.custom2')"
            :size="FormSize.Medium"
          >
            <template #suffix>
              <div
                class="c-mobile-donate-panel-cash__custom__random pws-mobile-donate-custom-cash-random"
                @click="onClickRandom"
              >
                {{ $lang('donate.random') }}
              </div>
            </template>
          </form-input>
        </form-item>
      </form-wrap>

      <div class="c-mobile-donate-panel-cash__custom__button">
        <normal-button
          class="pws-mobile-donate-send-button"
          :text="$lang('donate.confirm')"
          block
          :size="ButtonSize.Medium"
          @click="donateCash"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MobileIconArrowLeft } from '@/components/component-icons/mobile/map';
import { ButtonSize } from '@/components/common-base/normal-button/types';
import { useDonateCash } from '../hooks/use-donate-cash';
import FormWrap from '@/components/common-base/form/form-wrap.vue';
import FormItem from '@/components/common-base/form/form-item.vue';
import FormInput from '@/components/common-base/form/form-input/form-input.vue';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { ref } from 'vue';
import { PropUtils, useProps, emitFunc } from '@polyv/vue-components';
import { FormSize, FormTheme } from '@/components/common-base/form/types/enums';

import { useDonateStore } from '@/store/use-donate-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

const props = defineProps({
  /** 是否隐藏头部，默认：false */
  hideHeader: PropUtils.bool.def(false),
});

const emit = defineEmits({
  /** 返回 */
  back: emitFunc<void>(),
  /** 打赏成功 */
  'donate-success': emitFunc<void>(),
});

const { hideHeader } = useProps(props);

const { donateCashQuickOptions } = storeDefinitionToRefs(useDonateStore);

const { cashAmount, onClickRandom, onClickQuickOptions, donateCash } = useDonateCash({
  donateSuccess: () => emit('donate-success'),
});

/** 处理点击返回 */
function onClickBack() {
  emit('back');
}

/** 处理点击快捷数量 */
function onClickAmount(amount: number) {
  onClickQuickOptions(amount);
  donateCash();
}

/** 自定义金额是否显示 */
const customVisible = ref(false);

function onClickCustom() {
  cashAmount.value = '';
  customVisible.value = true;
}
</script>

<style lang="scss">
.c-mobile-donate-panel-cash__header {
  position: relative;
  font-size: 16px;
  line-height: 48px;
  text-align: center;
}
.c-mobile-donate-panel-cash__header__close {
  position: absolute;
  top: 50%;
  left: 16px;
  display: flex;
  font-size: 28px !important;
  transform: translateY(-50%);
}

.c-mobile-donate-panel-cash__options {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 16px 24px 12px;
}

.c-mobile-donate-panel-cash__options__item {
  width: 30%;
  margin-bottom: 8px;
  font-size: 16px;
  line-height: 40px;
  text-align: center;
  border: 1px solid transparent;
  border-radius: 20px;
}

.c-mobile-donate-panel-cash__custom-btn {
  padding-bottom: 20px;
  font-size: 16px;
  text-align: center;
}

.c-mobile-donate-panel-cash__custom {
  padding: 16px 24px;
}

.c-mobile-donate-panel-cash__custom__random {
  flex-shrink: 0;
  padding-right: 16px;
}

.c-mobile-donate-panel-cash__custom__button {
  box-sizing: border-box;
  width: 100%;
  padding: 20px 24px;
}
</style>
