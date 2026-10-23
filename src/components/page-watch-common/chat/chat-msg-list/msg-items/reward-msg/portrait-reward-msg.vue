<!-- @file 竖屏端打赏消息 -->
<template>
  <portrait-msg-container
    class="c-portrait-reward-msg"
    hide-user-info
  >
    <div
      class="c-portrait-reward-msg__inner"
      :class="[`c-portrait-reward-msg__inner--${effectData.effectType}`]"
      data-donate
      @click="onClickMsg"
    >
      <span
        v-if="!hideUserAvatar"
        class="c-portrait-reward-msg__avatar"
        :style="{
          backgroundImage: `url(${msgUserAvatar})`,
        }"
      ></span>
      <span
        :class="[
          'c-portrait-reward-msg__item',
          `c-portrait-reward-msg__item--${item.textType}`,
          {
            'pws-secondary-text-color': item.textType === 'nickname',
          },
        ]"
        v-for="(item, index) in getEffectText(effectData)"
        :key="index"
      >
        <span class="c-portrait-reward-msg__item__text">{{ item.text }}</span>

        <span
          v-if="item.textType === 'donateName' && item.image"
          class="c-portrait-reward-msg__item__donate-image"
          :style="{
            backgroundImage: `url(${resizeOSSImg(item.image)})`,
          }"
        ></span>
      </span>
    </div>
  </portrait-msg-container>
</template>

<script setup lang="ts">
import { useEffectText } from '@/components/page-watch-common/message-effect/hooks/use-effect-text';
import PortraitMsgContainer from '../_msg-container/portrait-msg-container.vue';
import { useRewardMsg } from './use-reward-msg';
import { useChatMsgUserInject } from '../_hooks/chat-msg-user-hook';
import { useResizeOssImage } from '@polyv/vue-components';

const { resizeOSSImg } = useResizeOssImage();

const { getEffectText } = useEffectText({
  sliceNickname: false,
});

const { effectData, msgUserAvatar, onClickMsg } = useRewardMsg();

const { hideUserAvatar } = useChatMsgUserInject();
</script>

<style lang="scss">
.c-portrait-reward-msg__inner {
  cursor: pointer;
}
.c-portrait-reward-msg__avatar {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-top: -3px;
  margin-right: 4px;
  vertical-align: middle;
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: 50%;
}
.c-portrait-reward-msg__item {
  line-height: 20px;
  color: #ff9f45;
}

.c-portrait-reward-msg__item--nickname {
  margin-right: 4px;
}

.c-portrait-reward-msg__item__donate-image {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-top: -4px;
  margin-left: 4px;
  vertical-align: middle;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  object-fit: contain;
}
</style>
