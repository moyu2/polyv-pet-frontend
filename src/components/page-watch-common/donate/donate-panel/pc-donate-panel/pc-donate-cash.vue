<!-- @file PC 端现金打赏组件 -->
<template>
  <div class="c-pc-donate-panel__cash">
    <div
      ref="referenceRef"
      class="c-pc-donate-panel__goods__item pws-pc-donate-good-item"
    >
      <img
        class="c-pc-donate-panel__goods__item__img"
        src="../imgs/redpack-cash.png"
      />
      <p class="c-pc-donate-panel__goods__item__name pws-pc-donate-good-name">
        {{ $lang('donate.title') }}
      </p>
      <p class="c-pc-donate-panel__goods__item__price pws-pc-donate-good-price">
        {{ $lang('donate.cash') }}
      </p>
    </div>

    <!-- 金额选择弹层 -->
    <transition name="fade">
      <div
        v-show="popperVisible"
        ref="popperRef"
        class="c-pc-donate-panel__good__select-count c-pc-donate-panel__cash__popper"
        data-donate
      >
        <pc-icon-close
          class="c-pc-donate-panel__good__select-count__close"
          @click="hidePopper"
        />
        <div class="c-pc-donate-panel__good__select-count__info">
          <img
            class="c-pc-donate-panel__good__select-count__info__img"
            src="../imgs/redpack-cash.png"
          />
          <p class="c-pc-donate-panel__good__select-count__info__name">
            {{ $lang('donate.title') }}
          </p>
          <p class="c-pc-donate-panel__good__select-count__info__price">
            {{ $lang('donate.cash') }}
          </p>
        </div>

        <ul class="c-pc-donate-panel__good__select-count__quicks">
          <li
            v-for="(item, index) in donateCashQuickOptions"
            :key="`quick-${index}`"
            class="c-pc-donate-panel__good__select-count__quicks__item"
            @click="onClickQuickOptions(item)"
          >
            ￥{{ item }}
          </li>
        </ul>

        <div class="c-pc-donate-panel__good__select-count__input">
          <span>{{ $lang('donate.custom') }}：</span>
          <div class="c-pc-donate-panel__good__select-count__input__input-wrap">
            <input v-model="cashAmount" />
            <span>{{ $lang('donate.yuan') }}</span>
          </div>
          <span
            class="c-pc-donate-panel__good__select-count__input__random"
            @click="onClickRandom"
          >
            {{ $lang('donate.random') }}
          </span>
        </div>

        <button
          class="c-pc-donate-panel__good__select-count__button"
          @click="donateCash"
        >
          {{ $lang('donate.confirm') }}
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { PcIconClose } from '@/components/component-icons/pc/map';
import { usePopper } from '@/hooks/components/use-popper';
import { useDonateCash } from '../hooks/use-donate-cash';

import { useDonateStore } from '@/store/use-donate-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { emitFunc } from '@polyv/vue-components';

const emit = defineEmits({
  /** 打赏完成 */
  'donate-finish': emitFunc<void>(),
});

const { donateCashQuickOptions } = storeDefinitionToRefs(useDonateStore);

const { referenceRef, popperRef, popperVisible, hidePopper } = usePopper({
  trigger: 'click',
  arrow: true,
});

const { cashAmount, onClickRandom, donateCash, onClickQuickOptions } = useDonateCash({
  donateSuccess: () => {
    hidePopper();
    emit('donate-finish');
  },
});
</script>

<style lang="scss">
.c-pc-donate-panel__cash__popper {
  .c-pc-donate-panel__good__select-count__quicks {
    margin: 0 22px;
  }
  .c-pc-donate-panel__good__select-count__quicks__item {
    width: 48px;
    margin: 3px 2px;
  }
}

.c-pc-donate-panel__good__select-count__input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 22px;
  margin-top: 4px;
  font-size: 12px;
  color: $--font-color-primary;
}

.c-pc-donate-panel__good__select-count__input__input-wrap {
  position: relative;

  input {
    box-sizing: border-box;
    width: 72px;
    height: 24px;
    padding-right: 18px;
    padding-left: 2px;
    text-align: center;
    border: 1px solid #eceef1;
    border-radius: 2px;
  }

  span {
    position: absolute;
    top: 0;
    right: 4px;
    line-height: 24px;
  }
}

.c-pc-donate-panel__good__select-count__input__random {
  margin-left: 4px;
  color: #2196f3;
  cursor: pointer;
}
</style>
