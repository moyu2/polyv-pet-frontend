<!-- @file 移动端表情选择 -->
<template>
  <div
    class="c-mobile-emotion-picker pws-mobile-emotion-picker"
    v-if="emotionResourceLoaded"
  >
    <div
      class="c-mobile-emotion-picker__panel-wrap"
      :class="{
        'c-mobile-emotion-picker__panel-wrap--image': faceEmotionEnabled && currentType === 'image',
      }"
    >
      <!-- face 表情 -->
      <div
        v-if="faceEmotionEnabled"
        class="c-mobile-emotion-picker__panel"
      >
        <mobile-emotion-face-picker
          :key="langStore.currentLang"
          @click-face="onClickFace"
        />
      </div>

      <!-- image 表情 -->
      <div
        v-if="imageEmotionEnabled"
        class="c-mobile-emotion-picker__panel"
      >
        <mobile-emotion-image-picker @click-image="onClickImage" />
      </div>
    </div>

    <!-- 底部 -->
    <div class="c-mobile-emotion-picker__bottom">
      <!-- Tab 切换 -->
      <div class="c-mobile-emotion-picker__tabs pws-mobile-emotion-picker-tabs">
        <div
          v-if="faceEmotionEnabled"
          class="c-mobile-emotion-picker__tabs-item pws-mobile-emotion-picker-tabs-item"
          :class="{
            'is-active': currentType === 'face',
          }"
          @click="switchEmotionTab('face')"
        >
          <mobile-icon-smiling-face class="c-mobile-emotion-picker__tabs-item__icon" />
        </div>
        <div
          v-if="imageEmotionEnabled"
          class="c-mobile-emotion-picker__tabs-item pws-mobile-emotion-picker-tabs-item"
          :class="{
            'is-active': currentType === 'image',
          }"
          @click="switchEmotionTab('image')"
        >
          <mobile-icon-heart class="c-mobile-emotion-picker__tabs-item__icon" />
        </div>

        <div
          class="c-mobile-emotion-picker__tabs-active pws-mobile-emotion-picker-tabs-active"
          :class="{
            'c-mobile-emotion-picker__tabs-active--image': currentType === 'image',
          }"
        ></div>
      </div>

      <!-- 删除按钮 -->
      <div
        class="c-mobile-emotion-picker__del-btn pws-mobile-emotion-picker-del-button"
        @click="onClickDelete"
      >
        <mobile-icon-delete class="c-mobile-emotion-picker__del-btn__icon" />
      </div>

      <!-- 发送按钮 -->
      <normal-button
        class="c-mobile-emotion-picker__send-btn"
        :text="$lang('chat.send')"
        :size="ButtonSize.Small"
        @click="onClickSend"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProps } from '@polyv/vue-components';
import NormalButton from '@/components/common-base/normal-button/normal-button.vue';
import { ButtonSize } from '@/components/common-base/normal-button/types';
import {
  MobileIconDelete,
  MobileIconHeart,
  MobileIconSmilingFace,
} from '@/components/component-icons/mobile/map';
import { useLangStore } from '@/store/use-lang-store';
import {
  emotionPickerEmits,
  emotionPickerProps,
  useEmotionPicker,
} from '../hooks/use-emotion-picker';
import MobileEmotionFacePicker from './mobile-emotion-face-picker.vue';
import MobileEmotionImagePicker from './mobile-emotion-image-picker.vue';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';

const props = defineProps(emotionPickerProps());

const emit = defineEmits(emotionPickerEmits());

const langStore = useLangStore();

const { emotionResourceLoaded } = storeDefinitionToRefs(useChatStore);

const { faceEmotionEnabled, imageEmotionEnabled } = useProps(props);

const { currentType, switchEmotionTab, onClickFace, onClickImage, onClickDelete, onClickSend } =
  useEmotionPicker({
    props,
    emit,
  });
</script>

<style lang="scss">
.c-mobile-emotion-picker {
  padding: 0 0 24px;
}

.c-mobile-emotion-picker__panel-wrap {
  position: relative;
  left: 0;
  display: flex;
  width: 200%;
  transition: 0.3s;
}
.c-mobile-emotion-picker__panel-wrap--image {
  left: -100%;
}

.c-mobile-emotion-picker__panel {
  box-sizing: border-box;
  flex-shrink: 0;
  width: 50%;
  height: 200px;
  max-height: 20vh;
  padding: 0 16px;
  overflow-y: auto;
}

.c-mobile-emotion-picker__bottom {
  display: flex;
  align-items: center;
  padding: 0 16px;
  margin-top: 8px;
}

.c-mobile-emotion-picker__tabs {
  position: relative;
  display: flex;
  margin-right: auto;
  overflow: hidden;
  border-radius: 16px;
}

.c-mobile-emotion-picker__tabs-item {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 32px;
  line-height: 32px;
}
.c-mobile-emotion-picker__tabs-item__icon {
  display: flex;
  font-size: 20px !important;
}
.c-mobile-emotion-picker__tabs-active {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 60px;
  height: 32px;
  border-radius: 16px;
  transition: 0.3s;
  &.c-mobile-emotion-picker__tabs-active--image {
    left: 60px;
  }
}

.c-mobile-emotion-picker__del-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 32px;
  margin-right: 8px;
  line-height: 32px;
  border-radius: 16px;

  .c-mobile-emotion-picker__del-btn__icon {
    display: flex;
    font-size: 24px !important;
  }
}

.c-mobile-emotion-picker__send-btn {
  min-width: 66px;
}
</style>
