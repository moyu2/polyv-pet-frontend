<!-- @file 特效消息 -->
<template>
  <portrait-msg-container
    class="c-portrait-effect-msg"
    hide-user-info
  >
    <div
      class="c-portrait-effect-msg__inner"
      :class="[`c-portrait-effect-msg__inner--${effectData.effectType}`]"
      @click="onClickMsg"
    >
      <span
        :class="[
          'c-portrait-effect-msg__item',
          `c-portrait-effect-msg__item--${item.textType}`,
          {
            'pws-secondary-text-color': item.textType === 'nickname',
          },
        ]"
        v-for="(item, index) in getEffectText(effectData)"
        :key="index"
      >
        <span class="c-portrait-effect-msg__item__text">{{ item.text }}</span>

        <span
          v-if="item.textType === 'nickname' && item.count && item.count > 1"
          class="c-portrait-effect-msg__item__nickname-count"
        >
          {{ getNicknameCountText(item.count) }}
        </span>
      </span>

      <mobile-icon-arrow-right class="c-portrait-effect-msg__icon" />
    </div>
  </portrait-msg-container>
</template>

<script setup lang="ts">
import PortraitMsgContainer from '../_msg-container/portrait-msg-container.vue';
import { useEffectMsg } from './use-effect-msg';
import { useEffectText } from '@/components/page-watch-common/message-effect/hooks/use-effect-text';
import { MobileIconArrowRight } from '@/components/component-icons/mobile/map';

const { effectData, onClickMsg } = useEffectMsg();

const { getEffectText, getNicknameCountText } = useEffectText();
</script>

<style lang="scss">
.c-portrait-effect-msg__inner {
  &.c-portrait-effect-msg__inner--ProductClick,
  &.c-portrait-effect-msg__inner--ProductBuy {
    cursor: pointer;
    .c-portrait-effect-msg__icon {
      display: inline-flex !important;
    }
  }
}

.c-portrait-effect-msg__item {
  line-height: 20px;
  // vertical-align: middle;
}

.c-portrait-effect-msg__item--nickname {
  margin-right: 4px;
}

.c-portrait-effect-msg__icon {
  display: none;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-top: -2px;
  overflow: hidden;
  font-size: 18px;
  vertical-align: middle;
}
</style>
