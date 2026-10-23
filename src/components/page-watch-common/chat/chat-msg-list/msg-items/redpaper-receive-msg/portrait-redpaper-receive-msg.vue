<!-- @file 竖屏端红包领取消息 -->
<template>
  <portrait-msg-container
    class="c-portrait-redpaper-receive-msg"
    hide-user-info
  >
    <span class="c-portrait-redpaper-receive-msg__content">
      <span class="pws-secondary-text-color">{{ receiveNick }}：</span>
      <i
        v-if="isRedpaperRain"
        class="c-portrait-redpaper-receive-msg__icon-rain g-img-cover"
      ></i>
      <i
        v-else
        class="c-portrait-redpaper-receive-msg__icon g-img-cover"
      ></i>

      <span>{{ $lang('redpack.get') }}</span>
      <span
        v-if="isRedpaperRain"
        class="c-portrait-redpaper-receive-msg__highlight"
        >{{ $lang('redpack.rain.name') }}</span
      >
      <span
        v-else-if="isRedpaperPassword"
        class="c-portrait-redpaper-receive-msg__highlight"
        >{{ $lang('redpack.password.name') }}</span
      >
      <span
        v-else-if="isRedpaperQuestion"
        class="c-portrait-redpaper-receive-msg__highlight"
        >{{ $lang('redpack.question.name') }}</span
      >
      <span
        v-else
        class="c-portrait-redpaper-receive-msg__highlight"
        >{{ $lang('redpack.normal.name') }}</span
      >

      <template v-if="isOver">
        <span v-if="isRedpaperRain">{{ $lang('redpack.rain.finish') }}</span>
        <span v-else>{{ $lang('redpack.finish') }}</span>
      </template>
    </span>
  </portrait-msg-container>
</template>

<script setup lang="ts">
import PortraitMsgContainer from '../_msg-container/portrait-msg-container.vue';
import { useRedpaperReceiveMsg } from './use-redpaper-receive-msg';

const { receiveNick, isRedpaperRain, isRedpaperPassword, isOver, isRedpaperQuestion } =
  useRedpaperReceiveMsg();
</script>

<style lang="scss">
.c-portrait-redpaper-receive-msg__content {
  font-size: 12px;
}

.c-portrait-redpaper-receive-msg__icon,
.c-portrait-redpaper-receive-msg__icon-rain {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-top: -2px;
  margin-right: 4px;
  vertical-align: middle;
}

.c-portrait-redpaper-receive-msg__icon {
  background-image: url(./imgs/redpaper-msg-ico.svg);
}

.c-portrait-redpaper-receive-msg__icon-rain {
  background-image: url(./imgs/redpaper-rain-msg-ico.svg);
}

.c-portrait-redpaper-receive-msg__highlight {
  color: #ffd16b;
}
</style>
