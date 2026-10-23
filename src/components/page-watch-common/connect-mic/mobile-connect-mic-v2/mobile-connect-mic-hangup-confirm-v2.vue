<!-- @file 移动端关闭连麦二次确认弹窗 v2 -->
<template>
  <mobile-popup
    class="c-mobile-connect-mic-hangup-confirm-v2"
    :visible.sync="popupVisibleSync"
    :show-header="false"
    :closable="false"
    :close-on-click-mask="true"
    :mask-opacity="0.4"
    content-background="transparent"
  >
    <div class="c-mobile-connect-mic-hangup-confirm-v2__inner">
      <div
        class="c-mobile-connect-mic-hangup-confirm-v2__item c-mobile-connect-mic-hangup-confirm-v2__item--danger"
        @click="onClickConfirm"
      >
        {{ $lang('connectMic.leave') }}
      </div>
      <div
        class="c-mobile-connect-mic-hangup-confirm-v2__item c-mobile-connect-mic-hangup-confirm-v2__item--cancel"
        @click="closePopup"
      >
        {{ $lang('base.cancel') }}
      </div>
    </div>
  </mobile-popup>
</template>

<script setup lang="ts">
import MobilePopup from '@/components/common-base/popup/mobile-popup.vue';
import { computed } from 'vue';
import { PropUtils, updateModelEmit, emitFunc } from '@polyv/vue-components';

const props = defineProps({
  visible: PropUtils.bool.def(false),
});

const emit = defineEmits({
  ...updateModelEmit<'visible', boolean>('visible'),
  /** 用户点击关闭连麦确认 */
  confirm: emitFunc<void>(),
});

const popupVisibleSync = computed({
  get: () => props.visible,
  set: (val: boolean) => emit('update:visible', val),
});

function closePopup() {
  popupVisibleSync.value = false;
}

function onClickConfirm() {
  emit('confirm');
  closePopup();
}
</script>

<style lang="scss">
.c-mobile-connect-mic-hangup-confirm-v2 {
  .c-mobile-popup__content {
    background-color: transparent;
    border-radius: 0;
  }
}

.c-mobile-connect-mic-hangup-confirm-v2__inner {
  padding-bottom: 16px;
  overflow: hidden;
  background-color: $--color-white;
  border-radius: 16px 16px 0 0;
}

.c-mobile-connect-mic-hangup-confirm-v2__item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  font-size: 16px;
  cursor: pointer;
  user-select: none;

  &:active {
    background-color: rgba(0, 0, 0, 0.04);
  }
}

.c-mobile-connect-mic-hangup-confirm-v2__item--danger {
  color: #f04b4f;
}

.c-mobile-connect-mic-hangup-confirm-v2__item--cancel {
  color: rgba(0, 0, 0, 0.85);
  border-top: 8px solid #f2f2f2;
}
</style>
