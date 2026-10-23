<!-- @file 移动端-邀请有礼活动标题小组件 -->

<template>
  <div class="c-mobile-invite-activity-title-widget">
    <div class="activity-mini-star activity-mini-star--small"></div>
    <div class="activity-mini-star"></div>
    <div class="c-mobile-invite-activity-title-widget__content">
      <slot>content</slot>
    </div>
    <div class="activity-mini-star"></div>
    <div class="activity-mini-star activity-mini-star--small"></div>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss">
.activity-mini-star {
  width: 6px;
  height: 6px;
  background: #ea5977;
  border-radius: 1px;
  transform: rotate(45deg);

  &--small {
    width: 4px;
    height: 4px;
    opacity: 0.4;
  }
}

.c-mobile-invite-activity-title-widget {
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 2px;
}

.c-mobile-invite-activity-title-widget__content {
  margin: 0 10px;
  font-family: 'PingFang SC';
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: #e75b48;
}
</style>
