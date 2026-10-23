<!-- @file 移动端-邀请有礼活动即将结束提示 -->
<template>
  <div
    v-show="visible"
    class="c-mobile-invite-activity-will-end-tip"
  >
    <div class="c-mobile-invite-activity-will-end-tip-icon g-img-cover"></div>
    <div class="c-mobile-invite-activity-will-end-tip-content">
      <p>{{ $lang('invite.activity.will.end.tips1') }}</p>
      <p class="c-mobile-invite-activity-will-end-tip-content__small-desc">
        {{ $lang('invite.activity.will.end.tips2') }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';

const visible = ref(true);

onMounted(() => {
  // 展示 5s 后自动隐藏
  setTimeout(() => {
    visible.value = false;
  }, 5 * 1000);
});
</script>

<style lang="scss">
/** 上下弹动动画 */
@keyframes bounce-up-down-animate {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(10px);
  }
  100% {
    transform: translateY(0);
  }
}

.c-mobile-invite-activity-will-end-tip {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-width: 136px;
  height: 42px;
  padding-right: 8px;
  background: #3575f9;
  border-radius: 22px;

  animation: bounce-up-down-animate 2s linear infinite;

  &::after {
    position: absolute;
    right: 28px;
    bottom: -4px;
    z-index: -1;
    content: '';
    border-color: #3575f9;
    border-style: solid;
    border-width: 8px;
    transform: rotate(45deg);
  }
}

.c-mobile-invite-activity-will-end-tip-icon {
  width: 42px;
  height: 48px;
  margin-right: 2px;
  background-image: url('./imgs/trophy.png');
}

.c-mobile-invite-activity-will-end-tip-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  font-size: 12px;
  color: #fff;
  .c-mobile-invite-activity-will-end-tip-content__small-desc {
    margin-top: 2px;
    font-size: 10px;
    color: rgba($color: #fff, $alpha: 0.8);
  }
}
</style>
