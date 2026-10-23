<template>
  <div class="c-common-other-live-booking-box">
    <div class="c-common-other-live-booking-box__title">{{ title }}</div>
    <div class="c-common-other-live-booking-box__time">
      {{ formatDate(new Date(startTime), 'MM/DD hh:mm') }}
    </div>
    <div class="c-common-other-live-booking-box__booking">
      <slot />
      <!-- <mobile-icon-bell class="c-common-other-live-booking-box__bell-icon" />
      <div
        class="c-common-other-live-booking-box__booking-btn"
        :class="{
          'c-common-other-live-booking-box__booking-btn--booked': isBooked,
        }"
        @click="handleBookingClick"
      >
        {{ isBooked ? '已预约' : '预约直播' }}
      </div> -->
    </div>
    <mobile-icon-close
      class="c-common-other-live-booking-box__close-icon"
      @click="handleCloseClick"
    />
  </div>
</template>

<script setup lang="ts">
import { MobileIconClose } from '@/components/component-icons/mobile/map';
import { formatDate } from '@polyv/utils/date';

interface Props {
  /** 直播标题 */
  title: string;
  /** 开始时间 */
  startTime: string | number;
  /** 是否已预约 */
  isBooked: boolean;
}
defineProps<Props>();

const emit = defineEmits<{
  /** 点击预约按钮时触发 */
  (event: 'booking-click'): void;
  /** 点击关闭按钮时触发 */
  (event: 'close-click'): void;
}>();

// const handleBookingClick = () => {
//   emit('booking-click');
// };

const handleCloseClick = () => {
  emit('close-click');
};
</script>

<style lang="scss">
.c-common-other-live-booking-box {
  box-sizing: border-box;
  display: inline-block;
  width: 120px;
  height: 120px;
  padding: 10px;
  font-family: 'PingFang SC';
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  &__title {
    display: -webkit-box;
    width: 82px;
    height: 32px;
    overflow: hidden;
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    color: #1d2129;
    text-overflow: ellipsis;
    word-break: break-all;
    white-space: normal;
    opacity: 0.6;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &__time {
    margin-top: 8px;
    font-size: 16px;
    font-weight: 500;
    line-height: 20px;
    color: #1d2129;
  }

  &__booking {
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
    gap: 2px;
    align-items: center;
    justify-content: center;
    width: 100%;
    line-height: 40px;
    color: #3f76fc;
    border-top: 1px solid rgba(29, 33, 41, 0.08);
  }

  &__booking-btn {
    font-size: 16px;
    font-weight: 500;
    color: #3f76fc;
  }

  &__booking-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
  }

  &__bell-icon {
    font-size: 20px;
    line-height: 15px;
    color: #3f76fc;
  }

  &__close-icon {
    position: absolute;
    top: 6px;
    right: 6px;
    font-size: 16px;
    color: #4e5969;
    cursor: pointer;
  }
}
</style>
