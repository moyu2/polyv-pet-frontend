<!-- @file 竖屏端消息用户信息 -->
<template>
  <div
    class="c-portrait-msg-user-info"
    :class="{
      'c-portrait-msg-user-info--actor': !hideUserActor,
      'c-portrait-msg-user-info--special': isSpecialUser,
      'c-portrait-msg-user-info--relax-mode': msgRelaxMode,
      'is-hide-avatar': hideUserAvatar,
    }"
  >
    <!-- 头像 -->
    <div
      v-if="msgUserAvatar && !hideUserAvatar"
      class="c-portrait-msg-user-info__avatar"
      :style="{
        backgroundImage: `url(${msgUserAvatar})`,
      }"
    ></div>

    <!-- 头衔 -->
    <portrait-msg-user-actor
      v-if="!hideUserActor"
      :actor="msgUserActor"
      :user-type="msgUserType"
    />

    <!-- 提问区标签 -->
    <template v-if="showUserQuestionLabel">
      <span
        v-for="(questionLabel, index) in msgUserQuestionLabels"
        :key="`${questionLabel}_${index}`"
        class="c-msg-user-actor c-msg-user-actor__questionLabel g-singleline"
      >
        <span class="c-msg-user-actor__content c-msg-user-actor__content__questionLabel-inner">
          {{ questionLabel }}
        </span>
      </span>
    </template>

    <!-- 昵称 -->
    <span
      class="c-portrait-msg-user-info__nick pws-secondary-text-color"
      :class="{
        'c-portrait-msg-user-info__nick--special': isSpecialUser,
      }"
      >{{ msgUserNick }}：</span
    >
  </div>
</template>

<script setup lang="ts">
import { PropUtils } from '@polyv/vue-components';
import PortraitMsgUserActor from '../_msg-user-actor/msg-user-actor.vue';
import { useMsgUserInfo } from './use-msg-user-info';

defineProps({
  /** 是否响应宽松模式 */
  msgRelaxMode: PropUtils.bool.def(false),
});

const {
  msgUserNick,
  msgUserActor,
  msgUserType,
  msgUserAvatar,
  msgUserQuestionLabels,
  hideUserActor,
  hideUserAvatar,
  isSpecialUser,
  // nicknameStyle,
  showUserQuestionLabel,
} = useMsgUserInfo();
</script>

<style lang="scss">
.c-portrait-msg-user-info {
  display: inline;
}
.c-portrait-msg-user-info--actor {
  transform: translateY(-1px);
}

// .c-portrait-msg-user-info__nick--special {
//   -webkit-background-clip: text;
//   background-clip: text;
// }

.c-portrait-msg-user-info__avatar {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 4px;
  vertical-align: middle;
  background-size: 100% 100%;
  border-radius: 50%;
  transform: translateY(-2px);
}

.c-portrait-msg-user-info--relax-mode {
  position: relative;
  display: flex;
  align-items: center;
  padding-left: 36px;
  margin-bottom: 2px;
  font-size: 12px;
  line-height: 18px;

  &.is-hide-avatar {
    padding-left: 0;
  }

  .c-portrait-msg-user-info__avatar {
    position: absolute;
    top: 0;
    left: 0;
    width: 28px;
    height: 28px;
    transform: translateY(0);
  }

  .c-portrait-msg-user-info__nick {
    flex: 1;
    @include singleline-text;
  }
}

.c-msg-user-actor__questionLabel {
  color: #fff;
  background-color: #626be9;
}
</style>
