<template>
  <div class="c-page-work-wechat-friend">
    <div class="c-page-work-wechat-friend__content">
      <transition name="fade">
        <img
          class="c-page-work-wechat-friend__image"
          v-show="canvasImage"
          :src="canvasImage"
          :alt="$lang('pageError.work.wechat.friend.title')"
        />
      </transition>
      <span v-show="!canvasImage">
        {{ $lang('pageError.work.wechat.friend.qrcode.generating') }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { usePageWorkWechatFriend } from './use-page-work-wechat-friend';

const { canvasImage } = usePageWorkWechatFriend();
</script>

<style lang="scss">
.c-page-work-wechat-friend {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f2f6;

  .c-page-work-wechat-friend__image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
