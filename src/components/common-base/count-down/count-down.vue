<!-- @file 倒计时组件 -->
<template>
  <div
    class="c-count-down"
    :class="{
      'c-count-down--small': size === 'small',
    }"
  >
    <!-- 方形样式 -->
    <div
      v-if="theme === 'square'"
      class="c-count-down__square"
    >
      <div
        v-for="(item, index) in realTimeContents"
        :key="`square-${index}`"
        class="c-count-down__square__item"
        :class="{
          'pws-pc-count-down-square-item': !isMobile,
          'pws-mobile-count-down-square-item': isMobile,
        }"
      >
        <div class="c-count-down__square__item__count pws-count-down-square-item-count">
          {{ item.text }}
        </div>
        <div class="c-count-down__square__item__word pws-count-down-square-item-word">
          {{ item.title }}
        </div>
      </div>
    </div>

    <!-- 数字方形样式 -->
    <div
      v-if="theme === 'number-square'"
      class="c-count-down__number-square"
      :class="{
        'is-pc': !isMobile,
      }"
    >
      <div
        v-for="(item, index) in realTimeContents"
        :key="`number-square-${index}`"
        class="c-count-down__number-square__item"
      >
        <span
          v-for="(text, numIndex) in item.text.split('')"
          :key="`number-square-${index}-${numIndex}`"
          class="c-count-down__number-square__item__count"
          :class="{
            'pws-dark-white-bg-20 pws-light-white-bg-100 pws-primary-text-color': isMobile,
          }"
          :style="countStyle"
        >
          {{ text }}
        </span>
        <span
          class="c-count-down__number-square__item__word"
          :class="{
            'pws-secondary-text-color': isMobile,
          }"
        >
          {{ item.title }}
        </span>
      </div>
    </div>

    <!-- 自定义样式 -->
    <div
      v-if="theme === 'red-square'"
      class="c-count-down__red-square"
    >
      <div
        v-for="(item, index) in realTimeContents"
        :key="`red-square-${index}`"
        class="c-count-down__red-square__item"
      >
        {{ item.text }}
      </div>
    </div>

    <!-- 文本样式 -->
    <div
      v-if="theme === 'text'"
      class="c-count-down__text"
    >
      <template v-for="(item, index) in realTimeContents">
        <div
          :key="`count-${index}`"
          class="c-count-down__text__count"
        >
          {{ item.text }}
        </div>
        <div
          :key="`unit-${index}`"
          class="c-count-down__text__unit"
        >
          {{ item.unit }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { isMobile } from '@/assets/utils/browser';
import { useProps } from '@polyv/vue-components';
import {
  countDownProps,
  countDownEmits,
  useCountDown,
  secondsToCountDownSurplus,
  getTimeContents,
} from './use-count-down';

const props = defineProps(countDownProps());

const emit = defineEmits(countDownEmits());

const { size, theme } = useProps(props);

const { timeContents } = useCountDown({
  props,
  emit,
});

const realTimeContents = computed(() => {
  if (props.customTimeSecond === undefined) {
    return timeContents.value;
  }

  const surplusTime = secondsToCountDownSurplus(props.customTimeSecond);

  return getTimeContents(surplusTime, {
    hideZeroDays: props.hideZeroDays,
    hideZeroHours: props.hideZeroHours,
  });
});
</script>

<style lang="scss">
.c-count-down {
  display: inline-block;
}

// square
.c-count-down__square {
  display: flex;
  align-items: center;
}

.c-count-down__square__item {
  position: relative;
  height: 80px;
  margin-right: 40px;
  text-align: center;
  border-radius: 4px;

  &:before,
  &:after {
    position: absolute;
    right: -22px;
    width: 4px;
    height: 4px;
    content: '';
    border-radius: 50%;
  }

  &:before {
    top: 28px;
  }
  &:after {
    bottom: 28px;
  }

  &:last-child {
    margin-right: 0 !important;

    &:before,
    &:after {
      display: none !important;
    }
  }
}

.c-count-down__square__item__count {
  box-sizing: border-box;
  min-width: 72px;
  padding: 0 10px;
  font-size: 42px;
  line-height: 56px;
  white-space: nowrap;
  border-bottom-style: solid;
  border-bottom-width: 1px;
}

.c-count-down__square__item__word {
  height: 23px;
  font-size: 12px;
  line-height: 23px;
}

.c-count-down__number-square {
  display: flex;
}
.c-count-down__number-square__item {
  display: flex;
  align-items: flex-end;
}
.c-count-down__number-square__item__count {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 26px;
  margin-right: 2px;
  font-family: DINPro-Medium;
  font-size: 20px;
  border-radius: 4px;
}
.c-count-down__number-square__item__word {
  margin-right: 4px;
  margin-left: 2px;
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
}
.c-count-down__number-square.is-pc {
  .c-count-down__number-square__item__count {
    width: 32px;
    height: 52px;
    margin-right: 4px;
    font-size: 34px;
    color: #fff;
    background: rgba(#fff, 0.2);
    border-radius: 8px;
  }
  .c-count-down__number-square__item__word {
    margin-right: 8px;
    margin-left: 4px;
    font-size: 20px;
    line-height: 28px;
    color: rgba(#fff, 0.6);
  }
}

// red-square
.c-count-down__red-square {
  display: flex;
}
.c-count-down__red-square__item {
  @include alibaba-font();
  position: relative;
  box-sizing: border-box;
  min-width: 17px;
  height: 16px;
  padding: 0 2px;
  margin-right: 10px;
  font-size: 12px;
  line-height: 16px;
  color: #fe3f52;
  text-align: center;
  background: rgba(254, 63, 82, 0.2);
  border-radius: 2px;

  &:before,
  &:after {
    position: absolute;
    right: -6px;
    width: 2px;
    height: 2px;
    content: '';
    background: #fe3f52;
    border-radius: 50%;
  }

  &:before {
    top: 4px;
  }
  &:after {
    bottom: 4px;
  }

  &:last-child {
    margin-right: 0 !important;

    &:before,
    &:after {
      display: none !important;
    }
  }
}

// text
.c-count-down__text {
  display: flex;
  align-items: center;
  font-size: 18px;
  line-height: 21px;
  color: #fff;
  letter-spacing: 1px;
}

.c-count-down__text__count + .c-count-down__text__unit,
.c-count-down__text__unit + .c-count-down__text__count {
  margin-left: 5px;
}

.c-count-down--small {
  .c-count-down__square__item {
    height: 40px;
    margin-right: 24px;
    border-radius: 4px;

    &:before,
    &:after {
      right: -14px;
    }

    &:before {
      top: 12px;
    }
    &:after {
      bottom: 12px;
    }
  }

  .c-count-down__square__item__count {
    min-width: 38px;
    padding: 0 9px;
    font-size: 16px;
    line-height: 24px;
  }

  .c-count-down__square__item__word {
    height: 16px;
    font-size: 12px;
    line-height: 16px;
    transform: scale(0.67);
  }

  .c-count-down__text {
    font-size: 14px;
  }

  .c-count-down__text__count + .c-count-down__text__unit,
  .c-count-down__text__unit + .c-count-down__text__count {
    margin-left: 3px;
  }
}
</style>
