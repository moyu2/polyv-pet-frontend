<!-- @file PC 端侧边 Tabs 标签头部 -->
<template>
  <div
    class="c-pc-aside-tab-header"
    :class="{
      'pws-main-tab-header pws-theme-mask-bg': !props.headerConfig.bgConfig,
    }"
    :style="generateBgStyle(props.headerConfig.bgConfig)"
  >
    <div
      ref="scrollRef"
      class="c-pc-aside-tab-header__content"
    >
      <div class="c-pc-aside-tab-header__list">
        <div
          v-for="(paneData, index) in tabPaneData"
          :key="index"
          ref="itemRef"
          class="c-pc-aside-tab-header__item"
          :class="{
            'pws-secondary-text-color': paneData.name !== currentTabName,
            'pws-primary-text-color is-active': paneData.name === currentTabName,
            'c-pc-aside-tab-header__item--reminder': paneData.showReminder,
            'c-pc-aside-tab-header__item--news': paneData.showNewMessage,
          }"
          :style="getTabItemStyle(paneData.name === currentTabName)"
          @click="onClickHeaderItem(paneData)"
        >
          <span class="c-pc-aside-tab-header__item__label">
            {{ paneData.label }}

            <span
              v-if="paneData.showNewMessage"
              class="c-pc-aside-tab-header__item__news"
            >
              {{ $lang('ask.news') }}
            </span>

            <span
              v-if="paneData.subLabel"
              class="c-pc-aside-tab-header__item__sub-label"
              >{{ paneData.subLabel }}</span
            >
          </span>

          <div
            v-if="
              headerConfig.activeItem &&
              headerConfig.activeItem.icon &&
              paneData.name === currentTabName
            "
            class="c-pc-aside-tab-header__item-right-icon"
            :style="{
              backgroundImage: `url(${headerConfig.activeItem.icon})`,
            }"
          ></div>
        </div>

        <div
          v-if="showUnderLine && tabPaneData.length > 1"
          ref="currentLineRef"
          class="c-pc-aside-tab-header__current-line pws-special-bg-color"
          :style="{
            left: `${currentLineLeft}px`,
          }"
        ></div>
      </div>
    </div>

    <!-- 左侧箭头 -->
    <div
      v-show="leftArrowVisible"
      class="c-pc-aside-tab-header__arrow--left pws-main-tab-header-arrow-left pws-theme-mask-bg"
      @click="onClickPrev"
    >
      <pc-icon-arrow-left class="c-pc-aside-tab-header__arrow__icon" />
    </div>
    <!-- 右侧箭头 -->
    <div
      v-show="rightArrowVisible"
      class="c-pc-aside-tab-header__arrow--right pws-main-tab-header-arrow-right pws-theme-mask-bg"
      @click="onClickNext"
    >
      <pc-icon-arrow-right class="c-pc-aside-tab-header__arrow__icon" />
    </div>
    <slot name="header-suffix"></slot>
  </div>
</template>

<script setup lang="ts">
import { useTabHeader, useTabHeaderArrow } from '../hooks/use-tab-header';
import { PcIconArrowLeft, PcIconArrowRight } from '@/components/component-icons/pc/map';
import { tabsHeaderProps } from '../hooks/use-tabs';
import { generateBgStyle } from '@/themes/utils/theme-config';

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
  showUnderLine,
  getTabItemStyle,
} = useTabHeader(props, {
  scrollCurrent: true,
});

const { leftArrowVisible, rightArrowVisible } = useTabHeaderArrow({
  scrollRef,
  tabPaneData,
  buffer: 6,
});
</script>

<style lang="scss">
.c-pc-aside-tab-header {
  position: relative;
  width: 100%;
  height: 40px;
  overflow: hidden;
  font-size: 16px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  // border-radius: 16px 16px 0 0;
  border-radius: inherit;
}

.c-pc-aside-tab-header__content {
  width: 100%;
  height: 100%;
  overflow-x: auto;
  &::-webkit-scrollbar {
    display: none;
  }
}

.c-pc-aside-tab-header__list {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  padding-left: 6px; // buffer
  white-space: nowrap;
}

.c-pc-aside-tab-header__item {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex: 1 0;
  align-items: center;
  justify-content: center;
  height: 80%;
  padding: 0 20px;
  text-align: center;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 16px;
}
.c-pc-aside-tab-header__item__label {
  position: relative;
  display: flex;
  align-items: flex-end;
}

.c-pc-aside-tab-header__item__sub-label {
  margin-left: 4px;
  font-family: DINPro-Medium;
  font-size: 12px;
  zoom: 0.83;
  opacity: 0.8;
}

.c-pc-aside-tab-header__item--reminder::after {
  width: 8px;
  height: 8px;
  margin-left: 3px;
  content: '';
  background-color: #f24453;
  border-radius: 50%;
}

.c-pc-aside-tab-header__item--news {
  .c-pc-aside-tab-header__item__news {
    position: absolute;
    bottom: 100%;
    left: 100%;
    padding: 0 6px;
    margin: 0 0 -7px -14px;
    font-size: 12px;
    line-height: 18px;
    color: #fff;
    white-space: nowrap;
    background: #ff5252;
    border-radius: 8px 8px 8px 0;
    transform: scale(0.78);
  }
}

.c-pc-aside-tab-header__current-line {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 16px;
  height: 2px;
  border-radius: 1px;
  transition-duration: 0.3s;
  transition-property: left;
}

.c-pc-aside-tab-header__arrow--left,
.c-pc-aside-tab-header__arrow--right {
  position: absolute;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 100%;
  font-size: 16px;
  cursor: pointer;
}
.c-pc-aside-tab-header__arrow--left {
  left: 0;
}
.c-pc-aside-tab-header__arrow--right {
  right: 0;
}

.c-pc-aside-tab-header__arrow__icon {
  position: relative;
}

.c-pc-aside-tab-header__item-right-icon {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background-repeat: no-repeat;
  background-position: right center;
  background-size: auto 100%;
}

.c-pc-aside-tab-header__item:has(.c-pc-aside-tab-header__item-right-icon) {
  .c-pc-aside-tab-header__item__label {
    left: -8px;
    padding-left: 8px;
  }
}

@media (max-width: 1680px) {
  .c-pc-aside-tab-header {
    height: 32px;
    font-size: 12px;
  }
  .c-pc-aside-tab-header__item {
    padding: 0 14px;
  }
}
</style>
