<!-- @file 移动端连麦更多设置弹窗 v2 -->
<template>
  <mobile-popup
    class="c-mobile-connect-mic-more-popup-v2"
    :visible.sync="popupVisibleSync"
    :show-header="false"
    :closable="false"
    :close-on-click-mask="true"
    :mask-opacity="0.4"
    content-background="transparent"
  >
    <div class="c-mobile-connect-mic-more-popup-v2__inner">
      <div class="c-mobile-connect-mic-more-popup-v2__group">
        <div
          v-if="supportFacingMode"
          class="c-mobile-connect-mic-more-popup-v2__item"
          @click="onClickToggleFacing"
        >
          {{ facingFlipped ? $lang('connectMic.flipToFront') : $lang('connectMic.flipToRear') }}
        </div>
        <div
          class="c-mobile-connect-mic-more-popup-v2__item"
          @click="onClickToggleMirror"
        >
          {{ mirrorEnabled ? $lang('connectMic.mirrorOn') : $lang('connectMic.mirrorOff') }}
        </div>
      </div>

      <div class="c-mobile-connect-mic-more-popup-v2__group">
        <div
          class="c-mobile-connect-mic-more-popup-v2__item c-mobile-connect-mic-more-popup-v2__item--cancel"
          @click="closePopup"
        >
          {{ $lang('base.cancel') }}
        </div>
      </div>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { FacingMode } from '@polyv/live-watch-sdk';
import { computed, unref } from 'vue';
import { PropUtils, updateModelEmit } from '@polyv/vue-components';

import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useConnectMicStore } from '@/store/use-connect-mic-store';
import { useConnectMicControl } from '../hooks/use-connect-mic';

const props = defineProps({
  visible: PropUtils.bool.def(false),
});

const emit = defineEmits({
  ...updateModelEmit<'visible', boolean>('visible'),
});

const popupVisibleSync = computed({
  get: () => props.visible,
  set: (val: boolean) => emit('update:visible', val),
});

const { supportFacingMode, facingMode, mirrorEnabled } = storeDefinitionToRefs(useConnectMicStore);
const { toggleFacingMode, toggleMirror } = useConnectMicControl();

/** 是否已翻转过摄像头（已切到后置） */
const facingFlipped = computed(() => unref(facingMode) === FacingMode.Environment);

function closePopup() {
  popupVisibleSync.value = false;
}

function onClickToggleFacing() {
  toggleFacingMode();
  closePopup();
}

function onClickToggleMirror() {
  toggleMirror();
  closePopup();
}
</script>

<style lang="scss">
.c-mobile-connect-mic-more-popup-v2 {
  .c-mobile-popup__content {
    background-color: transparent;
    border-radius: 0;
  }
}

.c-mobile-connect-mic-more-popup-v2__inner {
  padding-bottom: 16px;
  overflow: hidden;
  background-color: $--color-white;
  border-radius: 16px 16px 0 0;
}

.c-mobile-connect-mic-more-popup-v2__group {
  overflow: hidden;
  background-color: $--color-white;
}

.c-mobile-connect-mic-more-popup-v2__item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.85);
  cursor: pointer;
  user-select: none;

  & + & {
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }

  &:active {
    background-color: rgba(0, 0, 0, 0.04);
  }
}

.c-mobile-connect-mic-more-popup-v2__item--cancel {
  font-weight: 500;
  border-top: 8px solid #f2f2f2;
}
</style>
