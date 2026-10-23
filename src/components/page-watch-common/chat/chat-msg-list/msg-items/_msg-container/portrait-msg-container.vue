<!-- @file 竖屏端聊天消息容器 -->
<template>
  <div
    class="c-portrait-msg-container"
    @click="emit('click-container')"
    :class="{
      'c-portrait-msg-container--suffix-align-center': suffixMode === 'align-center',
      'c-portrait-msg-container--relax-mode': msgRelaxMode,
      'is-hide-avatar': hideUserAvatar,
    }"
  >
    <portrait-msg-user-info
      v-if="!hideUserInfo && msgRelaxMode"
      :msg-relax-mode="msgRelaxMode"
    />
    <div
      ref="referenceRef"
      class="c-portrait-msg-container__bubble pws-primary-text-color"
      :class="[
        bubbleBgClass,
        {
          'c-portrait-msg-container__bubble--hide-bubble-style': hideBubbleStyle && msgRelaxMode,
          'pws-special-bg-color-30': isSpecialUser,
        },
      ]"
    >
      <slot name="msg-header"></slot>

      <div
        class="c-portrait-msg-container__content"
        @click="onClickReferenceRef"
        @contextmenu="onContextMenu"
      >
        <div class="c-portrait-msg-container__content__inner">
          <portrait-msg-user-info v-if="!hideUserInfo && !msgRelaxMode" />
          <slot></slot>
        </div>
      </div>

      <slot name="msg-footer"></slot>
    </div>

    <!-- 气泡后缀内容 -->
    <div class="c-portrait-msg-container__content__suffix">
      <slot name="suffix"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isMobile } from '@/assets/utils/browser';
import { PropUtils, emitFunc } from '@polyv/vue-components';
import { computed, ref } from 'vue';
import PortraitMsgUserInfo from '../_msg-user-info/portrait-msg-user-info.vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useThemeStore } from '@/store/use-theme-store';
import { ThemeColorMode } from '@/themes/type/theme-color-mode';
import { useLayoutStore } from '@/store/use-layout-store';
import { useChatMsgUserInject } from '../_hooks/chat-msg-user-hook';
import { ChatMessageLayout } from '@polyv/live-watch-sdk';
import { useChatStore } from '@/store/use-chat-store';

const props = defineProps({
  /** 是否隐藏用户信息，默认：false */
  hideUserInfo: PropUtils.bool.def(false),
  /** 是否使用提示气泡，默认：false */
  useMsgTipsControl: PropUtils.bool.def(false),

  suffixMode: PropUtils.string.def('align-center'),
  /** 是否响应宽松模式 */
  responseRelax: PropUtils.bool.def(false),
  /** 宽松模式下不显示气泡样式 */
  hideBubbleStyle: PropUtils.bool.def(false),
});

const emit = defineEmits({
  /** 点击容器 */
  'click-container': emitFunc<void>(),
  /** 点击聊天消息显示气泡 */
  'click-msg-to-tips': emitFunc<{
    target: HTMLDivElement;
    originPosition: {
      x: number;
      y: number;
    };
    mountEl: string;
  }>(),
  /** 鼠标右键 */
  'bubble-contextmenu': emitFunc<MouseEvent>(),
});

const { isSpecialUser, hideUserAvatar } = useChatMsgUserInject();

const { chatSetting } = storeDefinitionToRefs(useChatStore);

const { currentSkinColorMode } = storeDefinitionToRefs(useThemeStore);

const { isPortraitWatchLayout } = storeDefinitionToRefs(useLayoutStore);

/** 是否宽松模式 */
const msgRelaxMode = computed(() => {
  let enabled = false;

  if (isPortraitWatchLayout.value) {
    enabled = chatSetting.value.portraitChatMessageLayout === ChatMessageLayout.Loose;
  } else {
    enabled = chatSetting.value.chatMessageLayout === ChatMessageLayout.Loose;
  }

  return props.responseRelax && enabled;
});

const referenceRef = ref(null);

function onClickReferenceRef(e: MouseEvent) {
  if (!referenceRef.value || !isMobile) return;
  const { x, y } = e;
  emit('click-msg-to-tips', {
    target: referenceRef.value,
    originPosition: {
      x,
      y,
    },
    mountEl: 'c-portrait-chat-msg-list__container',
  });
}

function onContextMenu(event: MouseEvent) {
  if (isMobile) {
    return;
  }
  emit('bubble-contextmenu', event);
}

const bubbleBgClass = computed(() => {
  if (isSpecialUser.value) {
    return '';
  }

  switch (currentSkinColorMode.value) {
    case ThemeColorMode.Dark:
      return 'pws-dark-basic-bg-20';
    case ThemeColorMode.Light:
    default:
      return 'pws-light-basic-bg-20';
  }
});
</script>

<style lang="scss">
.c-portrait-msg-container {
  display: flex;
  font-size: 14px;
  line-height: 22px;
}
.c-portrait-msg-container--relax-mode {
  display: block;
  margin: 12px 0;
  font-size: 16px;

  .c-portrait-msg-container__bubble {
    padding: 8px 10px;
    margin-left: 36px;
    border-radius: 8px;

    &.c-portrait-msg-container__bubble--hide-bubble-style {
      padding: 0;
      background: none !important;
      border-radius: 0;
    }
  }

  &.is-hide-avatar {
    .c-portrait-msg-container__bubble {
      margin-left: 0;
    }
  }
}
.c-portrait-msg-container__bubble {
  box-sizing: border-box;
  display: inline-block;
  max-width: 100%;
  padding: 3px 8px;
  border-radius: 12px;
}
.c-portrait-msg-container__content {
  position: relative;
  display: flex;
  align-items: center;
}
.c-portrait-msg-container__tips-bubble {
  padding: 10px 15px;
  font-size: 14px;
  color: rgba($--color-white, 0.8);
  white-space: nowrap;
  background-color: rgba(66, 68, 83, 0.95);
  border-radius: 4px;
}

.c-portrait-msg-container--suffix-align-center {
  .c-portrait-msg-container__content__suffix {
    align-self: center;
  }
}

.c-portrait-msg-container__content__suffix {
  flex-shrink: 0;
  margin-left: 6px;
  font-size: 12px;
  line-height: initial;
  white-space: nowrap;

  &:empty {
    display: none;
  }
}
</style>
