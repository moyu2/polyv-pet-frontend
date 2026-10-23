<!-- @file PC 端表情选择 -->
<template>
  <div
    class="c-pc-emotion-picker pws-pc-emotion-panel"
    v-if="emotionResourceLoaded"
  >
    <!-- face 表情 -->
    <div
      v-if="faceEmotionEnabled"
      v-show="currentType === 'face'"
      class="c-pc-emotion-picker__panel pws-pc-emotion-panel-scrollbar"
    >
      <pc-emotion-face-picker
        :key="langStore.currentLang"
        @click-face="onClickFace"
      />
    </div>

    <!-- image 表情 -->
    <div
      v-if="imageEmotionEnabled"
      v-show="currentType === 'image'"
      class="c-pc-emotion-picker__panel pws-pc-emotion-panel-scrollbar"
    >
      <pc-emotion-image-picker
        :key="langStore.currentLang"
        @click-image="onClickImage"
      />
    </div>

    <!-- 类型切换 -->
    <div class="c-pc-emotion-picker__tabs pws-pc-emotion-panel-type-tab">
      <div
        v-if="faceEmotionEnabled"
        class="c-pc-emotion-picker__tabs-item"
        :class="{
          'is-active': currentType === 'face',
        }"
        @click="switchEmotionTab('face')"
      >
        <span class="c-pc-emotion-picker__tabs-item__icon--face g-img-cover"></span>
      </div>
      <div
        v-if="imageEmotionEnabled"
        class="c-pc-emotion-picker__tabs-item"
        :class="{
          'is-active': currentType === 'image',
        }"
        @click="switchEmotionTab('image')"
      >
        <span class="c-pc-emotion-picker__tabs-item__icon--image g-img-cover"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLangStore } from '@/store/use-lang-store';
import PcEmotionFacePicker from './pc-emotion-face-picker.vue';
import PcEmotionImagePicker from './pc-emotion-image-picker.vue';
import { useProps } from '@polyv/vue-components';
import {
  emotionPickerEmits,
  emotionPickerProps,
  useEmotionPicker,
} from '../hooks/use-emotion-picker';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChatStore } from '@/store/use-chat-store';

const props = defineProps(emotionPickerProps());

const emit = defineEmits(emotionPickerEmits());

const langStore = useLangStore();

const { emotionResourceLoaded } = storeDefinitionToRefs(useChatStore);

const { faceEmotionEnabled, imageEmotionEnabled } = useProps(props);

const { currentType, switchEmotionTab, onClickFace, onClickImage } = useEmotionPicker({
  props,
  emit,
});
</script>

<style lang="scss">
.c-pc-emotion-picker__panel {
  height: 190px;
  overflow-y: auto;
  @include scrollbar;
}

.c-pc-emotion-picker__tabs {
  display: flex;
  align-items: center;
  height: 36px;
  padding-left: 12px;
  background-color: #3e3e4e;
}
.c-pc-emotion-picker__tabs-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 100%;
  cursor: pointer;
  border-radius: 0 0 4px 4px;

  &.is-active {
    background-color: #2b2c35;
  }
}
.c-pc-emotion-picker__tabs-item__icon--face,
.c-pc-emotion-picker__tabs-item__icon--image {
  width: 28px;
  height: 28px;
}
.c-pc-emotion-picker__tabs-item__icon--face {
  background-image: url(./imgs/icon-face-emotion.png);
}
.c-pc-emotion-picker__tabs-item__icon--image {
  background-image: url(./imgs/icon-image-emotion.png);
}
</style>
