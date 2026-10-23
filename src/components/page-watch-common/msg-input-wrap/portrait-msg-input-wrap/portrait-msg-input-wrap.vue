<!-- @file 竖屏端消息发送公用输入框 -->
<template>
  <div class="c-portrait-msg-input-wrap pws-portrait-chat-msg-input-control">
    <!-- 主体 -->
    <div class="c-portrait-msg-input-wrap__main">
      <form
        class="c-portrait-msg-input-wrap__main__form"
        @submit.prevent="submitInput"
      >
        <slot name="input-prefix"></slot>

        <input
          v-model="inputElmValue"
          :style="inputStyle"
          type="text"
          class="c-portrait-msg-input-wrap__main__input pws-portrait-chat-msg-input"
          :placeholder="placeholder"
          :disabled="disabledInput"
          ref="inputElemRef"
          maxlength="200"
          @focus="onInputFocus"
          @blur="onInputBlur"
        />

        <!-- 表情 -->
        <mobile-icon-emotion
          v-if="emotionPickerBtnVisible"
          v-show="!emotionVisible"
          class="c-portrait-msg-input-wrap__main__emotion pws-portrait-msg-input-icon"
          @click="onClickEmotionPickerBtn"
        />

        <!-- 键盘聚焦 -->
        <mobile-icon-keyboard
          v-show="emotionVisible"
          class="c-portrait-msg-input-wrap__main__emotion pws-portrait-msg-input-icon"
          @click="focusInput"
        />
      </form>

      <!-- 发送 -->
      <div
        class="c-portrait-msg-input-wrap__main__submit pws-portrait-msg-send-button"
        :class="{
          'c-portrait-msg-input-wrap__main__submit--disabled': sendBtnDisabled,
        }"
        @click="submitInput"
      >
        {{ $lang('chat.send') }}
      </div>
    </div>

    <!-- 表情选择面板 -->
    <plv-collapse-transition>
      <div
        v-show="emotionVisible"
        ref="emotionRef"
        class="c-portrait-msg-input-wrap__emotion-panel"
      >
        <mobile-emotion-picker
          :click-face-to-close="false"
          :face-emotion-enabled="faceEmotionEnabled"
          :image-emotion-enabled="imageEmotionEnabled"
          @click-face="onClickFace"
          @click-image="onClickImageEmotion"
          @close="hideEmotionPanel"
          @click-delete="deleteWord"
          @click-send="submitInput"
        />
      </div>
    </plv-collapse-transition>
  </div>
</template>

<script setup lang="ts">
import { MobileIconEmotion, MobileIconKeyboard } from '@/components/component-icons/mobile/map';
import MobileEmotionPicker from '@/components/page-watch-common/emotion-picker/mobile-emotion-picker/mobile-emotion-picker.vue';
import { PlvCollapseTransition } from '@/plugins/polyv-ui/admin-import';
import { msgInputWrapEmits, msgInputWrapProps, useMsgInputWrap } from '../use-msg-input-wrap';

const props = defineProps(msgInputWrapProps());

const emit = defineEmits(msgInputWrapEmits());

const {
  inputElemRef,
  inputElmValue,

  focusInput,

  emotionPickerBtnVisible,
  emotionRef,
  emotionVisible,
  hideEmotionPanel,
  deleteWord,
  onClickEmotionPickerBtn,
  onClickFace,
  onClickImageEmotion,

  sendBtnDisabled,
  submitInput,
  msgInputWrapInstance,
  onInputFocus,
  onInputBlur,
} = useMsgInputWrap({
  props,
  emit,
  clickFaceToFocus: false,
});

defineExpose(msgInputWrapInstance);
</script>

<style lang="scss">
.c-portrait-msg-input-wrap {
  color: $--color-white;
  background-color: #262523;
}

.c-portrait-msg-input-wrap__main {
  display: flex;
  align-items: center;
  padding: 8px 16px;
}

.c-portrait-msg-input-wrap__main__form {
  position: relative;
  display: flex;
  flex: 1;
}
.c-portrait-msg-input-wrap__main__input {
  box-sizing: border-box;
  display: block;
  width: 100%;
  height: 36px;
  padding: 0 32px 0 12px;
  font-size: 14px;
  color: $--color-white;
  resize: none;
  background-color: #373635;
  border: none;
  border-radius: 18px;
  outline: none;
}

.c-portrait-msg-input-wrap__main__submit {
  min-width: 40px;
  height: 36px;
  margin-left: 8px;
  line-height: 36px;
  // color: #ffa611;
  text-align: center;
}
.c-portrait-msg-input-wrap__main__submit--disabled {
  color: #c4c4c4;
}

.c-portrait-msg-input-wrap--emotion-show {
  .c-portrait-msg-input-wrap__main {
    padding-top: 16px;
    padding-bottom: 8px;
    border-radius: 8px 8px 0 0;
  }
}

.c-portrait-msg-input-wrap__main__emotion {
  position: absolute;
  top: 50%;
  right: 7px;
  display: flex;
  font-size: 24px !important;
  color: $--color-white;
  transform: translateY(-50%);
}
</style>
