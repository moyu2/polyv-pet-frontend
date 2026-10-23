<!-- @file PC 端打赏面板 -->
<template>
  <div class="c-pc-donate-panel pws-pc-donate-panel">
    <ul class="c-pc-donate-panel__goods pws-pc-donate-panel-scrollbar">
      <!-- 积分、现金道具打赏 -->
      <template v-if="showDonateGifts">
        <div
          v-for="(good, index) in donateItemList"
          :key="index"
          class="c-pc-donate-panel__goods__item pws-pc-donate-good-item"
          @click="onClickItem($event, good)"
        >
          <img
            class="c-pc-donate-panel__goods__item__img"
            :src="good.goodImage"
          />
          <p class="c-pc-donate-panel__goods__item__name pws-pc-donate-good-name">
            {{ good.goodTranslateName }}
          </p>
          <p class="c-pc-donate-panel__goods__item__price pws-pc-donate-good-price">
            {{ good.goodPriceText }}
          </p>
        </div>
      </template>

      <!-- 现金打赏 -->
      <donate-cash
        v-if="showDonateCash"
        @donate-finish="emit('donate-finish')"
      />
    </ul>

    <!-- 数量选择弹层 -->
    <transition name="fade">
      <div
        v-show="popperVisible"
        ref="popperRef"
        class="c-pc-donate-panel__good__select-count"
        data-donate
      >
        <pc-icon-close
          class="c-pc-donate-panel__good__select-count__close"
          @click="hidePopper"
        />
        <template v-if="selectedGood">
          <div class="c-pc-donate-panel__good__select-count__info">
            <img
              class="c-pc-donate-panel__good__select-count__info__img"
              :src="selectedGood.goodImage"
            />
            <p class="c-pc-donate-panel__good__select-count__info__name">
              {{ selectedGood.goodTranslateName }}
            </p>
            <p class="c-pc-donate-panel__good__select-count__info__price">
              {{ selectedGood.goodPriceText }}
            </p>
          </div>
          <ul class="c-pc-donate-panel__good__select-count__quicks">
            <li
              v-for="(item, index) in quickCounts"
              :key="`quick-${index}`"
              class="c-pc-donate-panel__good__select-count__quicks__item"
              :class="{
                'c-pc-donate-panel__good__select-count__quicks__item--selected':
                  item === donateCount,
              }"
              @click="donateCount = item"
            >
              {{ item }}
            </li>
          </ul>
          <button
            class="c-pc-donate-panel__good__select-count__button"
            @click="donateGood"
          >
            {{ $lang('donate.confirm') }}
          </button>
          <div
            v-if="showDonatePointGood"
            class="c-pc-donate-panel__good__select-count__surplus"
          >
            {{ $lang('donate.point.myPoint') }}
            <span>{{ surplusPoint }}</span>
            {{ donatePointUnit }}
          </div>
        </template>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { PcIconClose } from '@/components/component-icons/pc/map';
import DonateCash from './pc-donate-cash.vue';
import { usePopper } from '@/hooks/components/use-popper';
import { useDonateGood } from '../hooks/use-donate-good';
import { ref, unref } from 'vue';

import { DonateGoodInfo, useDonateStore } from '@/store/use-donate-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { emitFunc } from '@polyv/vue-components';

const emit = defineEmits({
  /** 打赏完成 */
  'donate-finish': emitFunc<void>(),
});

const { showDonateGifts, donateItemList, showDonatePointGood, showDonateCash } =
  storeDefinitionToRefs(useDonateStore);

/** 用于定位参考的元素 */
const referenceRef = ref<HTMLElement>();

const { popperRef, popperVisible, showPopper, hidePopper } = usePopper({
  referenceRef,
  trigger: 'custom',
  arrow: true,
  forceOutSideClickHide: true,
  outSideClickDelayHide: true,
});

const {
  selectedGood,
  setSelectedGood,
  quickCounts,
  donateCount,
  surplusPoint,
  donateGood,
  donatePointUnit,
} = useDonateGood({
  donateSuccess: () => {
    hidePopper();
    emit('donate-finish');
  },
});

/** 处理点击 */
function onClickItem(event: Event, good: DonateGoodInfo) {
  const targetElem = event.target as HTMLElement;
  referenceRef.value = targetElem;

  setSelectedGood(good);

  // 仅在积分打赏下才选择数量
  if (unref(showDonatePointGood)) {
    showPopper();
  } else {
    donateGood();
  }
}
</script>

<style lang="scss">
.c-pc-donate-panel {
  box-sizing: border-box;
  height: 100%;
  padding: 16px 0;
  overflow: hidden;
}

.c-pc-donate-panel__goods {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(auto-fill, 70px);
  justify-content: space-around;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  @include scrollbar;
}

.c-pc-donate-panel__goods__item {
  box-sizing: border-box;
  display: inline-block;
  width: 70px;
  height: 96px;
  text-align: center;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 2px;
  transition: all 0.1s ease-in-out;

  &:hover {
    background-color: rgba($--color-white, 0.1);
    border: 1px solid rgba($--color-white, 0.4);
  }

  & > * {
    pointer-events: none;
  }
}

.c-pc-donate-panel__goods__item__img {
  width: 48px;
  height: 48px;
  margin: 6px 11px 4px;
}

.c-pc-donate-panel__goods__item__name {
  margin: 4px 0;
  font-size: 13px;
  color: #ffffff;
}

.c-pc-donate-panel__goods__item__price {
  max-width: 100%;
  overflow: hidden;
  font-size: 12px;
  color: #adadc0;
  text-overflow: ellipsis;
  white-space: nowrap;
  transform: scale(0.83);
}

.c-pc-donate-panel__good__select-count {
  position: relative;
  box-sizing: border-box;
  width: 200px;
  padding: 24px 0;
  background: #fff;
  border-radius: 2px;
  box-shadow: $--popper-shadow;
}

.c-pc-donate-panel__good__select-count__close {
  position: absolute;
  top: 1px;
  right: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 16px !important;
  line-height: 32px;
  color: #546e7a;
  text-align: center;
  cursor: pointer;
}

.c-pc-donate-panel__good__select-count__info {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 56px;
  padding-left: 72px;
  margin: 0 32px 16px;
}
.c-pc-donate-panel__good__select-count__info__img {
  position: absolute;
  top: 0;
  left: 0;
  width: 56px;
  height: 56px;
}
.c-pc-donate-panel__good__select-count__info__name {
  font-size: 16px;
  color: $--font-color-primary;
}
.c-pc-donate-panel__good__select-count__info__price {
  max-width: 64px;
  margin-top: 8px;
  font-size: 12px;
  color: #ff5353;
  @include singleline-text;
}

.c-pc-donate-panel__good__select-count__quicks {
  margin: 0 28px;
}
.c-pc-donate-panel__good__select-count__quicks__item {
  box-sizing: border-box;
  display: inline-block;
  width: 40px;
  height: 24px;
  margin: 4px;
  font-size: 12px;
  line-height: 24px;
  color: $--font-color-primary;
  text-align: center;
  cursor: pointer;
  border: 1px solid #eceef1;
  border-radius: 2px;
}
.c-pc-donate-panel__good__select-count__quicks__item--selected {
  color: #ff5353;
  border-color: #ff5353;
}

.c-pc-donate-panel__good__select-count__button {
  display: block;
  width: 152px;
  height: 32px;
  margin: 16px auto 0;
  color: $--color-white;
  cursor: pointer;
  background-color: #ff5353;
  border: none;
  border-radius: 2px;
  outline: none;
}

.c-pc-donate-panel__good__select-count__surplus {
  margin-top: 8px;
  font-size: 12px;
  color: $--font-color-primary;
  text-align: center;
  span {
    color: #ff5722;
  }
}
</style>
