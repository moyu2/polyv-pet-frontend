<template>
  <div v-if="showDetachedWindow">
    <div class="pc-subtitle-detached-dialog__controls">
      <div class="pc-subtitle-detached-dialog__controls-opacity">
        <div class="pc-subtitle-detached-dialog__controls-opacity__label pws-primary-text-color">
          {{ $lang('subtitle.detached.title') }}
        </div>
        <div class="pc-subtitle-detached-dialog__controls-opacity__slider">
          <slider-bar
            :min="0"
            :max="100"
            :value="showContentOpacity"
            @drag-change="onopacityChange"
          />
          <div
            class="pc-subtitle-detached-dialog__controls-opacity__slider-labels pws-primary-text-color"
          >
            <div>{{ $lang('subtitle.detached.opacity') }}</div>
            <div>{{ showContentOpacity }} %</div>
            <div>{{ $lang('subtitle.detached.notOpacity') }}</div>
          </div>
        </div>
      </div>
    </div>
    <custom-teleport to="body">
      <div
        class="pc-subtitle-detached-dialog"
        :style="dialogStyle"
        ref="dialogRef"
      >
        <div
          class="pc-subtitle-detached-dialog__title"
          ref="dialogMoveHandle"
        >
          <span>{{ $lang('player.subtitle.text') }}</span>
          <pc-icon-close
            class="pc-subtitle-detached-dialog__close"
            @click="exitDetachedWindow"
          />
        </div>
        <div
          class="pc-subtitle-detached-dialog__content pc-subtitle-detached-dialog__content--scroll"
          :style="contentStyle"
        >
          <div ref="detachedList"></div>
          <div class="pc-subtitle-detached-dialog__content-slider"></div>
        </div>
      </div>
    </custom-teleport>
  </div>
</template>

<script lang="ts" setup>
import SliderBar from '@/components/common-base/slider-bar/slider-bar.vue';
import CustomTeleport from '@/components/common-base/custom-teleport/custom-teleport';

import { useSubtitleDetached } from './use-subtitle-detached';
import { nextTick, ref, watch, reactive, computed } from 'vue';
import { PlvPopperManager } from '@/plugins/polyv-ui/admin-import';

import { PcIconClose } from '@/components/component-icons/pc/map';

const detachedList = ref<HTMLElement | undefined>();
const dialogRef = ref<HTMLElement | null>(null);
const dialogMoveHandle = ref<HTMLElement | null>(null);
let destroyTheListener: { dispose: () => void } | undefined;
const { setDetachedSlots, initDragAndResize } = useSubtitleDetached();

const dialogStyle = reactive({
  left: 'calc(50% - 200px)',
  top: 'calc(50% - 250px)',
  width: '400px',
  height: '500px',
  zIndex: PlvPopperManager.zIndex,
});

const props = defineProps<{
  showDetachedWindow: boolean;
}>();

const emits = defineEmits<{
  (e: 'update:showDetachedWindow', value: boolean): void;
}>();

const exitDetachedWindow = () => {
  destroyTheListener?.dispose();
  emits('update:showDetachedWindow', false);
};

const contentStyle = reactive({
  opacity: 1,
});
const showContentOpacity = computed(() => Math.ceil(contentStyle.opacity * 100));

const onopacityChange = (value: number) => {
  contentStyle.opacity = value / 100;
};

watch(
  () => props.showDetachedWindow,
  newValue => {
    if (newValue) {
      nextTick(() => {
        if (detachedList.value) {
          // 设置分离窗口的默认插槽
          setDetachedSlots(detachedList.value);
        }
        destroyTheListener = initDragAndResize({
          dialogRef,
          dialogMoveHandle,
          dialogStyle,
        });
      });
    }
  },
  { immediate: true },
);
</script>

<style lang="scss">
.pc-subtitle-detached-dialog__controls {
  padding: 0 8px;
  color: #fff;
  .pc-subtitle-detached-dialog__controls-opacity {
    margin-top: 12px;
    &__label {
      font-size: 14px;
      text-align: left;
    }
    .pc-subtitle-detached-dialog__controls-opacity__slider-labels {
      display: flex;
      justify-content: space-between;
      margin-top: 4px;
      font-size: 12px;
      user-select: none;
    }
  }
}
.pc-subtitle-detached-dialog {
  position: fixed;
  display: flex;
  flex-direction: column;
  min-width: 200px;
  min-height: 150px;
  overflow: hidden;
  background-color: #00000077;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  box-shadow: rgba(0, 0, 0, 0.3) 0 8px 32px;
  backdrop-filter: blur(10px);
  &__title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    font-size: 16px;
    color: #fff;
    cursor: move;
    background-color: #00000099;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }
  &__close {
    font-size: 20px;
    color: #fff;
    cursor: pointer;
    &:hover {
      color: #ff0000;
    }
  }
  &__content {
    position: relative;
    flex: 1;
    padding: 8px;
    overflow: auto;

    &::-webkit-scrollbar {
      display: none;
    }
    &-slider {
      position: fixed;
      right: 2px;
      bottom: 2px;
      width: 15px;
      height: 15px;
      cursor: se-resize;
      background: linear-gradient(to left top, transparent 50%, #fff 50%, #fff 53%, transparent 53%),
        linear-gradient(to left top, transparent 65%, #fff 65%, #fff 68%, transparent 68%),
        linear-gradient(to left top, transparent 80%, #fff 80%, #fff 83%, transparent 83%);
      opacity: 0.8;
    }
    &--scroll {
      .c-pc-subtitle__new {
        position: fixed;
      }
    }
  }
}
</style>
