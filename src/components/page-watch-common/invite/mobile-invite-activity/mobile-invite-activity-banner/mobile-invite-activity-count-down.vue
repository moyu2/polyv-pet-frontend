<!-- @file 移动端-邀请有礼活动倒计时  -->

<template>
  <div class="c-mobile-invite-activity-count-down">
    <div class="c-mobile-invite-activity-count-down__tips">
      <span>{{ $lang('invite.activity.countdown.tips') }}</span>
    </div>

    <div class="c-mobile-invite-activity-count-down__text">
      <template v-for="(item, index) in timeContents">
        <div
          :key="`count-${index}`"
          class="c-mobile-invite-activity-count-down__text__count plv-font-din-pro-medium"
        >
          {{ item.text }}
        </div>
        <div
          :key="`unit-${index}`"
          class="c-mobile-invite-activity-count-down__text__unit"
        >
          {{ item.unit }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  countDownCommonProps,
  countDownEmits,
  useCountDown,
} from '@/components/common-base/count-down/use-count-down';

const props = defineProps(countDownCommonProps());

const emit = defineEmits(countDownEmits());

const { timeContents } = useCountDown({
  props,
  emit,
});
</script>

<style lang="scss">
.c-mobile-invite-activity-count-down {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-family: 'PingFang SC';
}

.c-mobile-invite-activity-count-down__tips {
  font-size: 12px;
  color: #e75b48;
  letter-spacing: 2px;
}

.c-mobile-invite-activity-count-down__text {
  display: flex;
  align-items: center;
  font-size: 16px;
  line-height: 21px;
  color: #e75b48;
  letter-spacing: 1px;
}

.c-mobile-invite-activity-count-down__text__count {
  display: inline-block;
  min-width: 28px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  background: #fff;
  border-radius: 4px;
  & + .c-mobile-invite-activity-count-down__text__unit {
    margin-left: 5px;
  }
}

.c-mobile-invite-activity-count-down__text__unit {
  font-size: 12px;
  & + .c-mobile-invite-activity-count-down__text__count {
    margin-left: 5px;
  }
}
</style>
