<!-- @file PC 端消息发送公用输入框 -->
<template>
  <div
    class="c-pc-msg-input-wrap pws-pc-msg-bottom-input-wrap"
    :class="{
      'pwc-skin-color-mode--dark': pageSkin === ChannelWatchPageSkin.Blue && !useNewTheme,
    }"
  >
    <!-- 面板区 -->
    <div class="c-pc-msg-input-wrap__panel">
      <!-- 表情选择 -->
      <div
        v-show="emotionVisible"
        ref="emotionRef"
        class="c-pc-msg-input-wrap__emotion-picker-wrap"
      >
        <pc-emotion-picker
          :face-emotion-enabled="faceEmotionEnabled"
          :image-emotion-enabled="imageEmotionEnabled"
          @click-face="onClickFace"
          @click-image="onClickImageEmotion"
          @close="hideEmotionPanel"
        />
      </div>

      <!-- 面板区插槽 -->
      <slot name="panel-suffix"></slot>
    </div>

    <!-- 图标区 -->
    <div class="c-pc-msg-input-wrap__icons">
      <!-- 表情 -->
      <div
        v-if="emotionPickerBtnVisible"
        data-emotion-picker-btn
        class="c-pc-msg-input-wrap__icons__item pws-pc-msg-bottom-input-wrap-item"
        :class="{
          'is-disabled': disabledEmotionPicker,
        }"
        @click="onClickEmotionPickerBtn"
      >
        <pc-icon-emotion />
      </div>

      <!-- 上传图片 -->
      <div
        v-if="sendImageEnabled"
        class="c-pc-msg-input-wrap__icons__item pws-pc-msg-bottom-input-wrap-item"
        :class="{
          'is-disabled': disabledSendImage,
        }"
        @click="onClickSendImage"
      >
        <pc-icon-pic />
      </div>

      <!-- 图标区插槽 -->
      <slot name="icon-suffix"></slot>
    </div>

    <!-- 输入框区 -->
    <div class="c-pc-msg-input-wrap__main">
      <!-- 设置昵称占位 -->
      <pc-set-nick-placeholder v-if="needSetNick" />
      <!-- 消息输入框 -->
      <div
        v-else
        class="c-pc-msg-input-wrap__msg-input"
      >
        <div
          class="c-pc-msg-input-wrap__input-wrap"
          @click="onClickInputWrap"
        >
          <plv-input-paste-image
            v-if="imagePasteInputEnabled"
            ref="imagePasteInputRef"
            class="c-pc-input-paste-image pws-pc-image-paste-input-wrapper"
            width="100%"
            :maxlength="maxInputTextLength"
            :max-image-count="9"
            :placeholder="placeholder"
            @is-overflow="onInputWidgetOverflow"
            :disabled="disabledInput"
            @over-max-image-count="overMaxImageCountHandler"
            @change="throttleOnImagePasteInputChange"
            @submit="submitInput"
            @preview="previewPastedImageHandler"
          />
          <pc-auto-textarea
            v-else
            ref="autoTextareaRef"
            v-model="autoTextareaInputValue"
            :placeholder="placeholder"
            :is-overflow.sync="wordLimitVisible"
            :maxlength="maxInputTextLength"
            :disabled="disabledInput"
            @submit="submitInput"
          />
        </div>

        <!-- 消息发送按钮 -->
        <div
          ref="sendButtonRef"
          class="c-pc-msg-input-wrap__send-btn pws-pc-msg-send-button"
          :class="{
            'is-disabled': sendBtnDisabled,
          }"
          @click="submitInput"
        >
          {{ $lang('chat.send') }}
        </div>

        <transition name="fade">
          <!-- 图片达到最大数量后的提示框 -->
          <div
            v-if="imagePasteInputEnabled"
            ref="sendButtonPopperRef"
            v-show="sendButtonPopperVisible && maxImageTipsVisible"
            class="c-pc-msg-input-popper__max-image-tips pws-pc-msg-input-popper__max-image-tips"
          >
            {{ $lang('chat.input.maxImageTips', { maxCount: '9' }) }}
            <pc-icon-close
              class="c-pc-msg-input-popper__max-image-tips__close"
              @click="onCloseMaxImageTips"
            />
          </div>
        </transition>

        <!-- 字数统计 -->
        <div
          v-if="wordLimitVisible"
          class="c-pc-msg-input-wrap__word-limit pws-pc-msg-input-limit"
        >
          {{ curInputTextLength }}/{{ maxInputTextLength }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { throttle } from 'lodash-es';
import { ChannelWatchPageSkin } from '@polyv/live-watch-sdk';
import { PlvInputPasteImage } from '@/plugins/polyv-ui/admin-import';
import { PcIconEmotion, PcIconPic, PcIconClose } from '@/components/component-icons/pc/map';
import PcEmotionPicker from '@/components/page-watch-common/emotion-picker/pc-emotion-picker/pc-emotion-picker.vue';
import PcAutoTextarea from '../auto-textarea/pc-auto-textarea.vue';
import PcSetNickPlaceholder from './pc-set-nick-placeholder.vue';

import { useViewerStore } from '@/store/use-viewer-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { msgInputWrapEmits, msgInputWrapProps, useMsgInputWrap } from '../use-msg-input-wrap';
import { usePopper } from '@/hooks/components/use-popper';
import { previewImage } from '@/hooks/components/use-image-preview';
import { useThemeStore } from '@/store/use-theme-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';

const props = defineProps(msgInputWrapProps());

const emit = defineEmits(msgInputWrapEmits());

const { hasNickname } = storeDefinitionToRefs(useViewerStore);
const { pageSkin } = storeDefinitionToRefs(useThemeStore);

const { useNewTheme } = storeDefinitionToRefs(useWatchAppStore);

const needSetNick = computed(() => {
  return !hasNickname.value;
});

const {
  imagePasteInputRef,
  onImagePasteInputChange,

  autoTextareaRef,
  autoTextareaInputValue,

  maxInputTextLength,
  curInputTextLength,
  wordLimitVisible,
  onInputWidgetOverflow,

  emotionPickerBtnVisible,
  emotionRef,
  emotionVisible,
  hideEmotionPanel,
  onClickEmotionPickerBtn,
  onClickFace,
  onClickImageEmotion,
  onClickSendImage,

  sendBtnDisabled,
  submitInput,
  msgInputWrapInstance,
} = useMsgInputWrap({ props, emit });

const throttleOnImagePasteInputChange = throttle(onImagePasteInputChange, 300);

const {
  referenceRef: sendButtonRef,
  popperRef: sendButtonPopperRef,
  popperVisible: sendButtonPopperVisible,
} = usePopper({
  trigger: 'custom',
  arrow: true,
  placement: 'top-start',
});

const maxImageTipsVisible = ref(false);
function onCloseMaxImageTips() {
  maxImageTipsVisible.value = false;
  sendButtonPopperVisible.value = false;
}
/** 超出图片数量钩子 */
function overMaxImageCountHandler() {
  maxImageTipsVisible.value = true;
  sendButtonPopperVisible.value = true;
  setTimeout(() => {
    onCloseMaxImageTips();
  }, 2 * 1000);
}

/** 预览粘贴图钩子 */
function previewPastedImageHandler(previewUrl: string) {
  previewImage(previewUrl);
}

function onClickInputWrap() {
  emit('click-input-wrap');
}

defineExpose(msgInputWrapInstance);
</script>

<style lang="scss">
// 图标栏高度
$--chat-input-icon-height: 20px;

$--chat-input-bg: #3e3e4e;

.c-pc-msg-input-wrap {
  position: relative;
  padding: 12px 8px;
  background-color: $--chat-input-bg;
  border-radius: 12px;
}

.c-pc-msg-input-wrap__panel {
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 100%;
  user-select: none;
}

.c-pc-msg-input-wrap__icons {
  display: flex;
  gap: 12px;
  align-items: center;
  height: $--chat-input-icon-height;
  margin-bottom: 12px;
  &:empty {
    height: 0;
    margin-bottom: 0;
  }
}

.c-pc-msg-input-wrap__icons__item {
  position: relative;
  color: #e4e4e4;
  cursor: pointer;
  transition: all ease-in-out 0.1s;

  .polyv-icon {
    display: flex;
    font-size: 20px !important;
  }

  &.is-disabled {
    cursor: default;
    opacity: 0.5;
  }

  &:not(.is-disabled):hover {
    color: #3082fe;
  }
}
.c-pc-msg-input-wrap__icons__item--dotted {
  &::after {
    position: absolute;
    top: 50%;
    right: -8px;
    width: 8px;
    height: 8px;
    margin-top: -4px;
    content: '';
    background-color: #f24453;
    border-radius: 50%;
  }
}

@media screen and (max-width: 1680px) {
  .c-pc-msg-input-wrap__icons {
    gap: 10px;
  }
}

.c-pc-msg-input-wrap__main {
  position: relative;
  min-height: 32px;
  font-size: 14px;
  color: $--color-white;
}

.c-pc-msg-input-wrap__input-wrap {
  flex: 1;
  flex-basis: 0;
}

.c-pc-msg-input-wrap__send-btn {
  flex-shrink: 0;
  width: 64px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  cursor: pointer;
  user-select: none;

  &.is-disabled {
    cursor: default;
  }
}

.c-pc-msg-input-wrap__word-limit {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 60px;
  height: 36px;
  font-size: 12px;
  line-height: 36px;
  color: #adadc0;
  text-align: center;
}
</style>
<style lang="scss">
$--textarea-min-height: 32px;

.c-pc-input-paste-image {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: $--textarea-min-height;
  background-color: #1a1b1f;

  .plv-input-paste-image {
    color: inherit;
    background: unset;
    border: none;

    @include scrollbar;

    &::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }
  }
  .plv-input-paste-image--disabled {
    background: unset !important;
    border: none !important;
  }
}

.c-pc-msg-input-popper__max-image-tips {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 16px;
  font-size: 14px;
  white-space: nowrap;
  border-radius: 20px;
}
.c-pc-msg-input-popper__max-image-tips__close {
  display: flex;
  font-size: 16px !important;
  color: inherit;
  cursor: pointer;
}
</style>
