import {
  PropUtils,
  VueProps,
  useProps,
  emitFunc,
  updateModelEmit,
  VueEmit,
} from '@polyv/vue-components';
import { PlvPopperManager } from '@/plugins/polyv-ui/admin-import';
import { computed, nextTick, ref, watch } from 'vue';
import type { PcSidePopupInstance } from './type';
import { useEventBusListener } from '@/app/app-events';

export const sidePcPopupProps = () => ({
  /** 弹层标题 */
  title: PropUtils.looseString,
  /** 弹层宽度 */
  width: PropUtils.string.def('375px'),
  /** 显示状态，默认：false，支持 .sync */
  visible: PropUtils.bool.def(false),
  /** 打开事件 */
  openEvent: PropUtils.looseString,
});

export const sidePcPopupEmits = () => ({
  ...updateModelEmit<'visible', boolean>('visible'),
  open: emitFunc<void>(),
  opened: emitFunc<void>(),
  close: emitFunc<void>(),
  closed: emitFunc<void>(),
});

export const sidePcPopupInstance = () => ({});

export const useSidePcPopup = (options: {
  props: VueProps<typeof sidePcPopupProps>;
  emits: VueEmit<typeof sidePcPopupEmits>;
}) => {
  const { props, emits } = options;
  const { visible } = useProps(props);

  const wrapRef = ref<HTMLDivElement>();

  const sidePopupStyle = computed(() => {
    return {
      width: props.width,
    };
  });

  async function raiseZIndex() {
    await nextTick();
    if (wrapRef.value) {
      PlvPopperManager.openPopper(wrapRef.value);
    }
  }

  function openPopup() {
    raiseZIndex();

    emits('open');
  }

  function closePopup() {
    emits('update:visible', false);
    emits('close');
  }

  function afterEnter() {
    emits('opened');
  }

  function afterLeave() {
    emits('closed');
  }

  watch(
    () => visible.value,
    newValue => {
      if (newValue) {
        openPopup();
      } else {
        closePopup();
      }
    },
    {
      immediate: true,
    },
  );

  // 对于传入了打开事件的组件，在每次触发时都置顶一次弹层
  if (props.openEvent) {
    useEventBusListener(props.openEvent, raiseZIndex);
  }

  const couponSidePopupInstance: PcSidePopupInstance = {
    raiseZIndex,
  };

  return {
    wrapRef,
    sidePopupStyle,
    afterEnter,
    afterLeave,
    closePopup,
    couponSidePopupInstance,
  };
};
