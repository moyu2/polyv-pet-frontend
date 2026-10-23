<!-- @file 移动端打赏面板 - 道具打赏 -->
<template>
  <div class="c-mobile-donate-panel-good">
    <div
      v-if="showDonatePointGood"
      class="c-mobile-donate-panel-good__point pws-mobile-donate-point-data"
    >
      <span>{{ $lang('donate.point.myPoint') }}</span>
      <span class="c-mobile-donate-panel-good__point__count pws-mobile-donate-point-data-count">
        {{ surplusPoint }}
      </span>
      {{ donatePointUnit }}
    </div>

    <div
      v-if="donateContentPages.length"
      class="c-mobile-donate-panel-good__carousel"
    >
      <plv-carousel>
        <plv-carousel-item
          v-for="(items, pageIndex) in donateContentPages"
          :key="`carousel-item-${pageIndex}`"
          class="c-mobile-donate-panel-good__carousel__item"
        >
          <ul class="c-mobile-donate-panel-good__goods">
            <template v-for="(good, index) in items">
              <!-- 现金 -->
              <li
                v-if="good.donateType === DonateType.Cash"
                :key="`good-${pageIndex}-${index}`"
                class="c-mobile-donate-panel-good__goods__item"
                @click="onClickCash"
              >
                <img
                  class="c-mobile-donate-panel-good__goods__item__img"
                  src="../imgs/redpack-cash.png"
                />
                <p
                  class="c-mobile-donate-panel-good__goods__item__name pws-mobile-donate-good-name"
                >
                  {{ $lang('donate.title') }}
                </p>
                <p
                  class="c-mobile-donate-panel-good__goods__item__price pws-mobile-donate-good-price"
                >
                  {{ $lang('donate.cash') }}
                </p>
              </li>
              <!-- 道具 -->
              <li
                v-if="good.donateType === DonateType.Good"
                :key="`good-${pageIndex}-${index}`"
                class="c-mobile-donate-panel-good__goods__item pws-mobile-donate-good-item"
                :class="{
                  'is-active': selectedGood && good.goodId === selectedGood.goodId,
                }"
                @click="onClickItem(good)"
              >
                <img
                  class="c-mobile-donate-panel-good__goods__item__img"
                  :src="good.goodImage"
                />
                <p
                  class="c-mobile-donate-panel-good__goods__item__name pws-mobile-donate-good-name"
                >
                  {{ good.goodTranslateName }}
                </p>
                <p
                  class="c-mobile-donate-panel-good__goods__item__price pws-mobile-donate-good-price"
                >
                  {{ good.goodPriceText }}
                </p>
              </li>
            </template>
          </ul>
        </plv-carousel-item>

        <template v-slot:indicator="{ count, slideIndex }">
          <div class="c-mobile-donate-panel-good__carousel__indicator">
            <div
              v-for="num in count"
              :key="`indicator-${num}`"
              class="c-mobile-donate-panel-good__carousel__indicator__item pws-mobile-donate-carousel-indicator-item"
              :class="{
                'is-active': num - 1 === slideIndex,
              }"
            ></div>
          </div>
        </template>
      </plv-carousel>
    </div>

    <!-- 数量选择 -->
    <div
      v-if="showDonatePointGood"
      class="c-mobile-donate-panel-good__count-choice"
    >
      <div
        v-for="(item, index) in quickCounts"
        :key="`count-${index}`"
        class="c-mobile-donate-panel-good__count-choice__item pws-mobile-donate-panel-option"
        :class="{
          'is-active': item === donateCount,
        }"
        @click="donateCount = item"
      >
        {{ item }}
      </div>

      <div
        class="c-mobile-donate-panel-good__count-choice__button pws-mobile-donate-send-button"
        @click="donateGood"
      >
        {{ $lang('donate.button') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlvCarousel, PlvCarouselItem } from '@/plugins/polyv-ui/mobile-import';

import { useDonateGood } from '../hooks/use-donate-good';
import { unref } from 'vue';
import { DonateType } from '@polyv/live-watch-sdk';

import { DonateGoodInfo, useDonateStore } from '@/store/use-donate-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { emitFunc } from '@polyv/vue-components';

const emit = defineEmits({
  /** 打开现金打赏 */
  'open-cash': emitFunc<void>(),
  /** 打赏成功 */
  'donate-success': emitFunc<void>(),
});

const { showDonatePointGood, showDonateCashGood, donateContentPages } =
  storeDefinitionToRefs(useDonateStore);

const {
  surplusPoint,
  selectedGood,
  setSelectedGood,
  quickCounts,
  donateCount,
  donateGood,
  donatePointUnit,
} = useDonateGood({
  donateSuccess: () => emit('donate-success'),
});

/** 处理点击 */
function onClickItem(good: DonateGoodInfo) {
  setSelectedGood(good);

  // 现金礼物打赏下直接打赏
  if (unref(showDonateCashGood)) {
    donateGood();
  }
}

function onClickCash() {
  emit('open-cash');
}
</script>

<style lang="scss">
.c-mobile-donate-panel-good {
  box-sizing: border-box;
  padding: 6px 8px 0;
}

.c-mobile-donate-panel-good__point {
  margin: 8px 8px 8px 0;
  font-size: 12px;
  text-align: right;
}

.c-mobile-donate-panel-good__carousel__item {
  height: 100% !important;
}

$--carousel-indicator-size: 4px;

.c-mobile-donate-panel-good__carousel__indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  margin-top: 3px;
}
.c-mobile-donate-panel-good__carousel__indicator__item {
  width: $--carousel-indicator-size;
  height: $--carousel-indicator-size;
  margin: 0 4px;
  border-radius: 50%;
}

.c-mobile-donate-panel-good__goods {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}

.c-mobile-donate-panel-good__goods__item {
  position: relative;
  box-sizing: border-box;
  flex-shrink: 0;
  width: 20%;
  height: 95px;
  text-align: center;
  border: 1px solid transparent;
  border-radius: 8px;
  transition: all 0.1s ease-in-out;
}

.c-mobile-donate-panel-good__goods__item__img {
  width: 48px;
  height: 48px;
  margin: 6px auto;
}
.c-mobile-donate-panel-good__goods__item__name {
  margin: 2px 0 4px;
  font-size: 13px;
}
.c-mobile-donate-panel-good__goods__item__price {
  max-width: 100%;
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
  transform: scale(0.83);
}

.c-mobile-donate-panel-good__count-choice {
  display: flex;
  align-items: center;
  padding: 0 8px 8px;
}

.c-mobile-donate-panel-good__count-choice__item {
  box-sizing: border-box;
  width: 36px;
  margin-right: 4px;
  font-size: 12px;
  line-height: 24px;
  text-align: center;
  border: 1px solid transparent;
  border-radius: 12px;
}

.c-mobile-donate-panel-good__count-choice__button {
  width: 54px;
  margin-left: auto;
  font-size: 14px;
  line-height: 32px;
  text-align: center;
  border-radius: 16px;
}
</style>
