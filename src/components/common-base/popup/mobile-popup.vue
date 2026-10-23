<!-- @file 移动端弹出层 -->
<template>
  <div
    ref="popupRef"
    v-show="wrapVisible"
    class="c-mobile-popup"
    :class="{
      'c-mobile-popup--backable': backable,
      'c-mobile-popup--portrait':
        theme === PopupTheme.Portrait || theme === PopupTheme.PortraitLight,
      'c-mobile-popup--portrait--dark': theme === PopupTheme.Portrait,
      'c-mobile-popup--portrait--light': theme === PopupTheme.PortraitLight,
      'c-mobile-popup--follow-page-skin': theme === PopupTheme.FollowPageSkin,
      'c-mobile-popup--hide-header-border': hideHeaderBorder,
      'c-mobile-popup--full-screen': fullScreen,
      'c-mobile-popup--screen__vertical': isVerticalScreen && !forceHorizontalScreen,
      'c-mobile-popup--screen__horizontal__force': isVerticalScreen && forceHorizontalScreen,
      'c-mobile-popup--screen__horizontal': isHorizontalScreen,
    }"
  >
    <!-- 底部蒙层 -->
    <transition :name="useTransition ? 'fade' : ''">
      <div
        v-show="contentVisible"
        class="c-mobile-popup__mask"
        :style="popupMaskStyle"
        @click="onClickMask"
      ></div>
    </transition>

    <transition
      :name="useTransition ? 'slide' : ''"
      @after-enter="onAfterEnter"
      @after-leave="onAfterLeave"
    >
      <div
        ref="popupContentRef"
        v-show="contentVisible"
        class="c-mobile-popup__content"
        :class="popupContentClass"
        :style="popupContentStyle"
      >
        <transition name="fade">
          <div
            v-show="draggableTipVisible"
            class="c-mobile-popup__content__draggable__tip"
          >
            <div class="c-mobile-popup__content__draggable__tip__content">
              {{ $lang('base.popup.supportDragUp') }}
            </div>
            <button
              class="c-mobile-popup__content__draggable__tip__button"
              @click="closeDraggableTip"
            >
              {{ $lang('base.popup.understood') }}
            </button>
          </div>
        </transition>
        <slot name="header">
          <div
            v-if="showHeader"
            class="c-mobile-popup__header"
            ref="popupContentHeaderRef"
          >
            <!-- 顶部提示拖拽的 icon -->
            <div
              v-if="draggable"
              class="c-mobile-popup__header__top__icon"
            ></div>
            <!-- 返回按钮 -->
            <div
              v-if="backable"
              class="c-mobile-popup__header__btn c-mobile-popup__header__btn__back"
              :class="{
                'pws-mobile-popup__header__btn': theme === PopupTheme.FollowPageSkin,
              }"
              @click="onClickBack"
            >
              <slot name="back-btn">
                <mobile-icon-arrow-left class="c-mobile-popup__header__btn__back__icon" />
              </slot>
            </div>
            <!-- 标题 -->
            <h2
              class="c-mobile-popup__header__title"
              :class="{
                'pws-mobile-popup__header__title': theme === PopupTheme.FollowPageSkin,
              }"
            >
              <slot name="title">{{ title }}</slot>
            </h2>
            <!-- 关闭按钮 -->
            <div
              v-if="closable"
              class="c-mobile-popup__header__btn c-mobile-popup__header__btn__close"
              :class="{
                'pws-mobile-popup__header__btn': theme === PopupTheme.FollowPageSkin,
              }"
              @click="closePopup"
            >
              <mobile-icon-close class="c-mobile-popup__header__btn__close__icon" />
            </div>
          </div>
        </slot>

        <div
          class="c-mobile-popup__body"
          ref="popupContentBodyRef"
          :class="{
            'c-mobile-popup__body--scrollbar': forceShowBodyScrollbar,
          }"
          @scroll="onPopupBodyScroll"
        >
          <transition name="fade">
            <div
              v-show="dialogTips"
              class="c-mobile-popup__tips"
            >
              {{ dialogTips }}
            </div>
          </transition>

          <slot></slot>
        </div>

        <div class="c-mobile-popup__footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { MobileIconArrowLeft, MobileIconClose } from '@/components/component-icons/mobile/map';
import { useDialogTips } from '@/components/common-base/dialog/use-dialog-tips';
import { PopupTheme } from './types';
import { popupEmits, popupProps, usePopup } from './use-popup';

const { dialogTips } = useDialogTips();

const props = defineProps(popupProps());

const emit = defineEmits(popupEmits());

const {
  wrapVisible,
  contentVisible,
  popupRef,
  popupContentRef,
  popupContentHeaderRef,
  popupContentBodyRef,
  popupMaskStyle,
  popupContentStyle,
  popupContentClass,
  popupInstance,
  onAfterEnter,
  onAfterLeave,
  onClickMask,
  onClickBack,
  onPopupBodyScroll,
  closePopup,

  draggableTipVisible,
  closeDraggableTip,

  isVerticalScreen,
  isHorizontalScreen,
} = usePopup({
  props,
  emit,
});

defineExpose(popupInstance);
</script>

<style lang="scss">
.c-mobile-popup {
  position: absolute;
  z-index: $--zIndex-top;
  box-sizing: border-box;
}

// 屏幕纵向
.c-mobile-popup--screen__vertical {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: rotate(0deg);
  .c-mobile-popup__content {
    bottom: 0;
    left: 0;
    transform: rotate(0deg);
  }
}

// 屏幕纵向，但强制横屏展示
.c-mobile-popup--screen__horizontal__force {
  top: 50%;
  bottom: 0 !important;
  left: 50%;
  width: $--plv-mobile-watch-full-screen-vh;
  height: $--plv-mobile-watch-full-screen-vw;
  transform: translate(-50%, -50%) rotate(90deg);
  .c-mobile-popup__content {
    right: 0;
    bottom: 0;

    width: 100vw !important;
    height: 100vw !important;
    transform: rotate(0deg);

    &--screen__horizontal__left {
      left: 0 !important;
    }

    &--screen__horizontal__center {
      left: 0 !important;
      margin: auto;
    }
  }
}

// 屏幕横向
.c-mobile-popup--screen__horizontal {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: rotate(0deg);
  // 屏幕横屏时，默认 popup 展示在屏幕右边
  .c-mobile-popup__content {
    top: 0;
    right: 0;
    bottom: 0;
    left: unset;

    width: 100vh !important;
    height: 100% !important;
    transform: rotate(0deg);

    &--screen__horizontal__left {
      left: 0 !important;
    }

    &--screen__horizontal__center {
      left: 0 !important;
      margin: auto;
    }
  }
}

.c-mobile-popup__mask {
  position: absolute;
  top: -100%;
  left: 0;
  width: 100%;
  height: 200%;
}

.c-mobile-popup__content {
  position: absolute;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  // 避免弹窗主体内容过高，溢出到屏幕顶部外。
  max-height: 100vh;
  // overflow: hidden;
  background-color: $--color-white;
  border-radius: 8px 8px 0 0;
}

.c-mobile-popup__content__draggable__tip {
  position: absolute;
  top: -61px;
  right: 0;
  left: 0;
  z-index: 1;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 266px;
  height: 48px;
  margin: auto;
  background: #ffa611;
  border-radius: 8px;
}

.c-mobile-popup__content__draggable__tip__content {
  display: inline-block;
  margin-right: 16px;

  font-size: 16px;
  color: #ffffff;
}
.c-mobile-popup__content__draggable__tip::after {
  position: absolute;
  top: 0;
  right: 0;
  bottom: -74px;
  left: 0;
  z-index: -1;
  display: block;
  width: 0;
  height: 20px;
  margin: auto;
  content: '';
  border-top: 0;
  border-right: 10px solid transparent;
  border-bottom: 12px solid #ffa611;
  border-left: 10px solid transparent;
  transform: rotate(-180deg);
}

.c-mobile-popup__content__draggable__tip__button {
  display: inline-block;
  width: 82px;
  height: 28px;

  font-size: 14px;
  line-height: 1;
  color: #ffa611;
  text-align: center;
  background: #ffffff;
  border-radius: 642px;
}

.c-mobile-popup__header {
  flex-shrink: 0;
  width: 100%;
  height: 50px;
  border-bottom: 1px solid $--border-color-primary;
}
.c-mobile-popup__header__top__icon {
  position: absolute;
  top: 7px;
  right: 0;
  left: 0;

  width: 60px;
  height: 5px;
  margin: auto;
  background: #adb0b9;
  border-radius: 60px;
}

.c-mobile-popup__header__title {
  font-size: 16px;
  font-weight: 400;
  line-height: 50px;
  color: $--font-color-primary;
  text-align: center;
}
.c-mobile-popup__header__btn {
  position: absolute;
  top: 0;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  min-width: 50px;
  height: 50px;
  color: $--font-color-info;
}
.c-mobile-popup__header__btn__close__icon,
.c-mobile-popup__header__btn__back__icon {
  display: flex;
  font-size: 28px !important;
}
.c-mobile-popup__header__btn__back {
  left: 0;
}
.c-mobile-popup__header__btn__close {
  right: 0;
}

.c-mobile-popup__body {
  box-sizing: border-box;
  flex: 1;
  overflow-y: auto;
}
.c-mobile-popup__body--scrollbar {
  overflow-y: scroll;
  @include scrollbar(rgba(#333333, 0.2), 8px);
}

.c-mobile-popup__tips {
  height: 32px;
  font-size: 14px;
  line-height: 32px;
  color: $--color-white;
  text-align: center;
  background: #fb7272;
}

.c-mobile-popup--portrait {
  .c-mobile-popup__header {
    border-bottom: none;
  }
  .c-mobile-popup__header__title {
    padding: 0 16px;
    text-align: left;
  }

  &.c-mobile-popup--backable {
    .c-mobile-popup__header__btn__back {
      width: 38px;
      font-size: 20px;
    }
    .c-mobile-popup__header__title {
      padding-left: 38px;
    }
  }

  &--dark {
    .c-mobile-popup__content {
      background-color: $--bg-color-portrait-popup;
    }
    .c-mobile-popup__header__title {
      color: $--color-white;
    }
    .c-mobile-popup__header__btn {
      color: $--color-white;
    }
  }
}

// 保持和 portrait 的布局处理
.c-mobile-popup--follow-page-skin {
  .c-mobile-popup__header {
    border-bottom: none;
  }
  .c-mobile-popup__header__title {
    padding: 0 16px;
    text-align: left;
  }

  &.c-mobile-popup--backable {
    .c-mobile-popup__header__btn__back {
      width: 38px;
      font-size: 20px;
    }
    .c-mobile-popup__header__title {
      padding-left: 38px;
    }
  }
}

.c-mobile-popup--hide-header-border {
  .c-mobile-popup__header {
    border-bottom: none;
  }
}

.c-mobile-popup--full-screen {
  z-index: $--zIndex-top + 1;
  padding-top: 0;

  .c-mobile-popup__content {
    border-radius: 0;
  }
}
</style>
