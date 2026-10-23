<!-- @file PC 端常规 Tabs 标签头部 -->
<template>
  <div class="c-pc-normal-tab-header g-clearfix pws-next-pc-normal-tab-header pws-theme-mask-bg">
    <div
      ref="scrollRef"
      class="c-pc-normal-tab-header__content"
    >
      <div class="c-pc-normal-tab-header__list">
        <div
          v-for="(paneData, index) in tabPaneData"
          :key="index"
          ref="itemRef"
          class="c-pc-normal-tab-header__header__item pws-next-pc-normal-tab-header__item"
          :class="{
            'c-pc-normal-tab-header__header__item--current': paneData.name === currentTabName,
            'pws-next-pc-normal-tab-header__item--current': paneData.name === currentTabName,
          }"
          @click="onClickHeaderItem(paneData)"
        >
          <div
            v-if="isWeixin && paneData.hackWeixinBtn"
            :id="generateHackWeixinBtnId(paneData.name)"
            class="c-pc-normal-tab-header__hack-weixin-btn"
          ></div>
          {{ paneData.label }}
        </div>

        <div
          v-if="tabPaneData.length > 0"
          ref="currentLineRef"
          class="c-pc-normal-tab-header__current-line pws-next-primary-bg-color"
          :style="{
            left: `${currentLineLeft}px`,
          }"
        ></div>
      </div>
    </div>

    <!-- 左侧箭头 -->
    <div
      v-show="leftArrowVisible"
      class="c-pc-normal-tab-header__arrow--left pws-next-main-tab-header-arrow-left pws-theme-mask-bg"
      @click="onClickPrev"
    >
      <pc-icon-arrow-left class="c-pc-normal-tab-header__arrow__icon" />
    </div>
    <!-- 右侧箭头 -->
    <div
      v-show="rightArrowVisible"
      class="c-pc-normal-tab-header__arrow--right pws-next-main-tab-header-arrow-right pws-theme-mask-bg"
      @click="onClickNext"
    >
      <pc-icon-arrow-right class="c-pc-normal-tab-header__arrow__icon" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { isWeixin } from '@/assets/utils/browser';
import { useTabHeader, useTabHeaderArrow } from '../hooks/use-tab-header';
import { PcIconArrowLeft, PcIconArrowRight } from '@/components/component-icons/pc/map';
import { generateHackWeixinBtnId, tabsHeaderProps } from '../hooks/use-tabs';

const props = defineProps(tabsHeaderProps());

const {
  tabPaneData,
  currentTabName,
  currentLineRef,

  onClickHeaderItem,
  onClickNext,
  onClickPrev,
  scrollRef,
  itemRef,
  currentLineLeft,
} = useTabHeader(props);

const { leftArrowVisible, rightArrowVisible } = useTabHeaderArrow({
  scrollRef,
  tabPaneData,
  buffer: 6,
});
</script>

<style lang="scss">
.c-pc-normal-tab-header {
  position: sticky;
  top: 0;
  z-index: 20;
  width: 100%;
  overflow: hidden;
  // border-bottom: 1px solid $--border-color-primary;
}

.c-pc-normal-tab-header__content {
  width: 100%;
  height: 100%;
  overflow-x: auto;
  &::-webkit-scrollbar {
    display: none;
  }
}

.c-pc-normal-tab-header__list {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  padding-left: 6px; // buffer
  white-space: nowrap;
}

.c-pc-normal-tab-header__header__item {
  position: relative;
  float: left;
  height: 44px;
  padding: 0 12px;
  font-size: 16px;
  line-height: 44px;
  color: #aaa;
  cursor: pointer;
  transition-duration: 0.3s;
  transition-property: color;
}

.c-pc-normal-tab-header__header__item--current {
  color: $--font-color-primary;
  cursor: default;
}

.c-pc-normal-tab-header__current-line {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 20px;
  height: 2px;
  background-color: $--color-primary;
  border-radius: 4px;
  transition-duration: 0.3s;
  transition-property: left;
}

.c-pc-normal-tab-header__hack-weixin-btn {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 11;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.c-pc-normal-tab-header__arrow--left,
.c-pc-normal-tab-header__arrow--right {
  position: absolute;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 100%;
  font-size: 16px;
  cursor: pointer;
  background-color: #fff;
}
.c-pc-normal-tab-header__arrow--left {
  left: 0;
}
.c-pc-normal-tab-header__arrow--right {
  right: 0;
}
.c-pc-normal-tab-header__arrow__icon {
  position: relative;
}
</style>
