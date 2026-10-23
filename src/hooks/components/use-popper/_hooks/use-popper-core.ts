/**
 * @file @popperjs/core 相关的 hook
 */
import { ref, unref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { createPopper, Instance as PopperInstance, OptionsGeneric, Modifier } from '@popperjs/core';
import type { EventListenersModifier } from '@popperjs/core/lib/modifiers/eventListeners';
import type { OffsetModifier } from '@popperjs/core/lib/modifiers/offset';
import type { ComputeStylesModifier } from '@popperjs/core/lib/modifiers/computeStyles';
import type { ArrowModifier } from '@popperjs/core/lib/modifiers/arrow';
import { PopperOptions } from '../_popper-type';

/**
 * 构建 popperjs 的配置
 */
export const usePopperCoreOptions = (
  popperOptions: PopperOptions,
  getPopperCtx: () => PopperInstance | undefined,
) => {
  const { onPopperEvent, placement, popperOffset, forceZIndex } = popperOptions;

  // 样式计算，使用 top/left/right/bottom 进行定位
  const computeStylesMod: Pick<ComputeStylesModifier, 'name' | 'options'> = {
    name: 'computeStyles',
    options: {
      gpuAcceleration: false,
      adaptive: false,
    },
  };

  // 事件监听
  const eventListenersMod: Pick<EventListenersModifier, 'name' | 'fn'> = {
    name: 'eventListeners',
    fn: ({ state }) => {
      const isReferenceHidden = !!state.modifiersData.hide?.isReferenceHidden;
      if (typeof onPopperEvent === 'function') {
        onPopperEvent({ isReferenceHidden });
      }

      if (state.styles.popper && forceZIndex) {
        state.styles.popper.zIndex = String(forceZIndex);
      }
    },
  };

  // 偏移量
  const offsetMod: Pick<OffsetModifier, 'name' | 'options'> = {
    name: 'offset',
    options: {
      offset: ({ placement }) => {
        let skidding = 0;
        let distance = 0;

        const offsetVal = unref(popperOffset);
        if (offsetVal) {
          const offsetValSkidding = offsetVal[0] ?? 0;
          const offsetValDistance = offsetVal[1] ?? 0;
          skidding += offsetValSkidding;
          distance += offsetValDistance;
        }

        // 根据箭头的大小自动叠加 offset
        const ctx = getPopperCtx();
        const arrowElem = ctx?.state?.elements?.arrow;
        if (arrowElem instanceof HTMLElement) {
          const width = arrowElem.offsetWidth;
          const height = arrowElem.offsetHeight;

          if (placement.includes('top') || placement.includes('bottom')) {
            distance += height / 2;
          }

          if (placement.includes('left') || placement.includes('right')) {
            distance += width / 2;
          }
        }

        return [skidding, distance];
      },
    },
  };

  // 箭头
  const arrowMod: Pick<ArrowModifier, 'name' | 'options'> = {
    name: 'arrow',
    options: {
      padding: 6,
    },
  };

  const popperCoreOptions = computed<OptionsGeneric<Modifier<unknown, unknown>>>(() => {
    return {
      placement: unref(placement),
      strategy: 'absolute',
      modifiers: [computeStylesMod, eventListenersMod, offsetMod, arrowMod],
    } as OptionsGeneric<Modifier<unknown, unknown>>;
  });

  return {
    /** 弹层选项 */
    popperCoreOptions,
  };
};

export const usePopperCore = (popperOptions: PopperOptions) => {
  const { getElement, popperVisible } = popperOptions;

  const { popperCoreOptions } = usePopperCoreOptions(popperOptions, getPopperCtx);

  /** 弹层 sdk 实例 */
  const popperCtx = ref<PopperInstance | undefined>(undefined);

  /** 获取弹层 sdk 实例 */
  function getPopperCtx(): PopperInstance | undefined {
    return unref(popperCtx);
  }

  /** 更新弹层位置 */
  async function updatePopper() {
    await nextTick();

    const ctx = getPopperCtx();
    if (ctx) {
      ctx.update();
    }
  }

  /** 创建弹窗 SDK */
  function createPopperCore() {
    destroyPopperCore();

    const { referenceElem, popperElem } = getElement();
    if (referenceElem && popperElem) {
      popperCtx.value = createPopper(referenceElem, popperElem, unref(popperCoreOptions));
    }
  }

  /** 销毁弹层 SDK */
  function destroyPopperCore() {
    const ctx = getPopperCtx();
    if (ctx) {
      ctx.destroy();
    }
  }

  // 是否第一次 update
  let isFirstUpdate = true;

  watch(
    () => unref(popperVisible),
    () => {
      if (unref(popperVisible)) {
        updatePopper();

        /**
         * 在 popperjs 中，横向弹层在首次 update 时会不准，垂直方向定位会有一点偏差，第二次之后才准
         * 这里判断在首次 update 且横向弹出时，延迟 10ms 再次进行 update 来解决这个问题
         */
        const ctx = getPopperCtx();
        if (ctx && isFirstUpdate && /left|right/.test(ctx.state.placement)) {
          setTimeout(() => {
            updatePopper();
          }, 10);
        }
        isFirstUpdate = false;
      }
    },
  );

  watch(
    () => unref(popperCoreOptions),
    () => {
      const ctx = getPopperCtx();
      if (ctx) {
        ctx.setOptions(unref(popperCoreOptions));
      }
    },
  );

  watch(getElement, () => createPopperCore());

  onMounted(() => {
    createPopperCore();
  });

  onUnmounted(() => {
    destroyPopperCore();
  });

  return {
    popperCtx,
    getPopperCtx,
    updatePopper,
    createPopperCore,
    destroyPopperCore,
  };
};
