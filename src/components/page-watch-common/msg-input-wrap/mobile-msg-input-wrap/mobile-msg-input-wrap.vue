<!-- @file 移动端消息发送公用输入框 -->
<template>
  <div
    class="c-mobile-msg-input-wrap pws-mobile-msg-input-wrap"
    :class="{
      'c-mobile-msg-input-wrap--emotion-show pws-mobile-msg-input-wrap-emotion-show':
        emotionVisible,
      'c-mobile-msg-input-wrap--alway-active pws-mobile-msg-input-wrap-alway-active': isAlwayActive,
      'c-mobile-msg-input-wrap--focus': isInputFocus,
    }"
    :style="wrapStyle"
  >
    <!-- 主体前部插槽 -->
    <slot name="main-prefix"></slot>

    <!-- 主体 -->
    <div
      ref="mainRef"
      class="c-mobile-msg-input-wrap__main pws-mobile-msg-input-wrap-main"
      :class="{
        'c-mobile-msg-input-wrap__main--multi-row': isMultiRow,
      }"
    >
      <!-- 输入框 -->
      <div
        class="c-mobile-msg-input-wrap__input"
        @click="onClickInputWrap"
      >
        <!-- 设置昵称占位 -->
        <div
          v-if="!hasNickname"
          class="c-mobile-msg-input-wrap__input__set-nick"
        ></div>

        <mobile-auto-textarea
          class="c-mobile-msg-input-wrap__input__textarea"
          ref="autoTextareaRef"
          v-model="autoTextareaInputValue"
          :placeholder="placeholder"
          :is-overflow.sync="wordLimitVisible"
          :is-multi-row.sync="isMultiRow"
          :maxlength="maxInputTextLength"
          :disabled="disabledInput"
          :input-style="inputStyle"
          @submit="submitInput"
          @focus="onInputFocus"
          @blur="onInputBlur"
        >
          <template #suffix>
            <!-- 表情 -->
            <div
              v-if="emotionPickerBtnVisible"
              v-show="!emotionVisible"
              data-emotion-picker-btn
              class="c-mobile-msg-input-wrap__emotion-btn pws-mobile-msg-input-suffix-icon"
              :class="{
                'c-mobile-msg-input-wrap__emotion-btn--disabled': disabledEmotionPicker,
              }"
              @click="onClickEmotionPickerBtn"
            >
              <mobile-icon-emotion class="c-mobile-msg-input-wrap__emotion-btn__icon" />
            </div>

            <!-- 键盘聚焦 -->
            <div
              v-show="emotionVisible"
              class="c-mobile-msg-input-wrap__emotion-btn pws-mobile-msg-input-suffix-icon"
              @click="focusInput"
            >
              <mobile-icon-keyboard class="c-mobile-msg-input-wrap__emotion-btn__icon" />
            </div>
          </template>
        </mobile-auto-textarea>
      </div>

      <!-- 发送按钮 -->
      <div
        v-show="showSendBtn"
        class="c-mobile-msg-input-wrap__button pws-mobile-msg-send-button"
        @click="submitInput"
      >
        {{ $lang('chat.send') }}
      </div>

      <!-- 后缀插槽 -->
      <template v-if="!showSendBtn && renderSuffixSlot">
        <slot name="suffix"></slot>
      </template>
    </div>

    <!-- 表情选择面板 -->
    <plv-collapse-transition>
      <div
        v-show="emotionVisible"
        ref="emotionRef"
        class="c-mobile-msg-input-wrap__panel"
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
import MobileAutoTextarea from '../auto-textarea/mobile-auto-textarea.vue';
import MobileEmotionPicker from '@/components/page-watch-common/emotion-picker/mobile-emotion-picker/mobile-emotion-picker.vue';
import { PlvCollapseTransition } from '@/plugins/polyv-ui/admin-import';
import { msgInputWrapProps, msgInputWrapEmits, useMsgInputWrap } from '../use-msg-input-wrap';
import { computed, onMounted, ref, unref, watch } from 'vue';
import { CSSProperties } from 'vue/types/jsx';
import { PropUtils } from '@polyv/vue-components';
import { useViewerStore } from '@/store/use-viewer-store';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';

const props = defineProps({
  ...msgInputWrapProps(),
  /** 是否渲染后缀插槽 */
  renderSuffixSlot: PropUtils.bool.def(false),
  /** 是否处于激活状态 */
  isAlwayActive: PropUtils.bool.def(false),
});

const emit = defineEmits(msgInputWrapEmits());

const { hasNickname } = storeDefinitionToRefs(useViewerStore);

const {
  autoTextareaRef,
  autoTextareaInputValue,

  isInputFocus,
  focusInput,
  onInputBlur,
  onInputFocus,

  deleteWord,

  maxInputTextLength,
  wordLimitVisible,

  emotionPickerBtnVisible,
  emotionRef,
  emotionVisible,
  hideEmotionPanel,
  onClickEmotionPickerBtn,
  onClickFace,
  onClickImageEmotion,

  submitInput,
  msgInputWrapInstance,
} = useMsgInputWrap({
  props,
  emit,
  clickFaceToFocus: false,
});

function onClickInputWrap() {
  emit('click-input-wrap');
}

/** ------------ 主体外层高度处理 ------------ */
/** 主体节点 */
const mainRef = ref<HTMLDivElement>();
/** 主体高度 */
const mainClientHeight = ref(0);
/** 重置主体高度 */
async function resetMainClientHeight() {
  setTimeout(() => {
    const mainElem = unref(mainRef);
    if (!mainElem) return;
    mainClientHeight.value = mainElem.clientHeight;
  }, 50);
}
onMounted(() => {
  resetMainClientHeight();
});
watch(
  () => unref(autoTextareaInputValue),
  () => resetMainClientHeight(),
);

/** 组件外层样式 */
const wrapStyle = computed(() => {
  const style: CSSProperties = {};

  if (unref(emotionVisible)) {
    style.height = `${unref(mainClientHeight)}px`;
  }

  return style;
});

const isMultiRow = ref(false);

/** 是否显示发送按钮 */
const showSendBtn = computed(() => {
  // 输入框有内容
  if (unref(autoTextareaInputValue)) {
    return true;
  }

  // 正在打开表情选择
  if (unref(emotionVisible)) {
    return true;
  }

  // 如果不显示插槽则常驻
  if (!props.renderSuffixSlot) {
    return true;
  }

  return isInputFocus.value;
});

defineExpose(msgInputWrapInstance);
</script>

<style lang="scss">
@import './var.scss';

.c-mobile-msg-input-wrap {
  position: relative;
  z-index: 999;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 56px;
}

.c-mobile-msg-input-wrap__main {
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  gap: 12px;
  align-items: center;
  width: 100%;
  padding: 8px 16px 24px;

  &.c-mobile-msg-input-wrap__main--multi-row {
    align-items: flex-end;

    .c-mobile-auto-textarea {
      align-items: flex-end;
    }
  }
}

.c-mobile-msg-input-wrap__input {
  position: relative;
  flex: 1;
  min-height: $--mobile-msg-input-wrap-base-height;
}

.c-mobile-msg-input-wrap__input__set-nick {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1; // 增加层级来处理 ios 下输入框会自动被聚焦的情况
  width: 100%;
  height: 100%;
}

.c-mobile-msg-input-wrap__input__textarea {
  min-width: 80px;
}

.c-mobile-msg-input-wrap__emotion-btn {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  margin-top: 7px;
  margin-right: 7px;
  margin-bottom: 7px;
  margin-left: -9px;
}
.c-mobile-msg-input-wrap__emotion-btn__icon {
  display: flex;
  font-size: 24px !important;
}
.c-mobile-msg-input-wrap__emotion-btn--disabled {
  opacity: 0.5;
}

.c-mobile-msg-input-wrap__button {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: $--mobile-msg-input-wrap-base-height;
  text-align: center;
}

.c-mobile-msg-input-wrap__panel {
  flex-shrink: 0;
  width: 100%;
}

.c-mobile-msg-input-wrap--emotion-show {
  z-index: #{$--zIndex-pendant + 1};
  .c-mobile-msg-input-wrap__main {
    padding-top: 16px;
    padding-bottom: 8px;
    border-radius: 8px 8px 0 0;
  }
}
.c-mobile-msg-input-wrap--alway-active {
  .c-mobile-msg-input-wrap__main {
    padding: 12px 12px 10px;
  }
}
</style>
