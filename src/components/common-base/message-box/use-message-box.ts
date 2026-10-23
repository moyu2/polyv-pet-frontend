import { onMounted, ref } from 'vue';
import { PlvPopperManager } from '@/plugins/polyv-ui/admin-import';

import { PropUtils, VueProps, emitFunc, VueEmit } from '@polyv/vue-components';

import { dialogPcProps } from '@/components/common-base/dialog/use-dialog';

export interface MessageBoxInstance {
  /** 手动显示确认框 */
  $open: () => void;
  /** 手动关闭确认框 */
  $close: () => void;
  /** 显示确认框，并获取确认结果 */
  $confirm: () => Promise<boolean>;
}

export enum MessageBoxType {
  Confirm = 'Confirm',
}

export enum MessageBoxPositionType {
  Fix = 'fix',
  Absolute = 'absolute',
}

export const messageBoxCommonProps = () => ({
  /** 组件内部不会使用这个 props，只允许通过 $confirm 之类的实例方法来打开 */
  visible: PropUtils.bool.def(false),
  /** 弹层标题 */
  title: PropUtils.string.def(''),
  /** 是否插入到 body 中，默认：true */
  appendToBody: PropUtils.bool.def(true),
  /** 内容居中 */
  contentCenter: PropUtils.bool.def(false),
  /** 定位类型 */
  positionType: PropUtils.enum<MessageBoxPositionType>().def(MessageBoxPositionType.Fix),

  // =======================

  /** 消息框框类型 */
  type: PropUtils.enum<MessageBoxType>().def(MessageBoxType.Confirm),
  /** 消息内容 */
  content: PropUtils.string.def(),
  /** 取消按钮文本 */
  cancelButtonText: PropUtils.string.def(),
  /** 确认按钮文本 */
  confirmButtonText: PropUtils.string.def(),
  /** 确认按钮id */
  confirmButtonWeixinId: PropUtils.string.def(),
});

export const messageBoxPcProps = () => ({
  ...dialogPcProps(),
  ...messageBoxCommonProps(),
});

export const messageBoxMobileProps = () => ({
  ...messageBoxCommonProps(),
  /** 是否旋转 */
  isRotate: PropUtils.bool.def(false),
});

export const messageBoxEmits = () => ({
  /** 取消回调 */
  cancel: emitFunc<void>(),
  /** 确认回调 */
  confirm: emitFunc<void>(),
  /** 进入之后 */
  'after-enter': emitFunc<void>(),
  /** 离开之后 */
  'after-leave': emitFunc<void>(),
  /** 点击链接 */
  'click-link': emitFunc<HTMLAnchorElement>(),
});

export const useMessageBox = (options: {
  props: VueProps<typeof messageBoxCommonProps>;
  emit: VueEmit<typeof messageBoxEmits>;
}) => {
  const { props, emit } = options;

  const messageBoxRef = ref();

  /** 是否显示消息弹窗，默认显示关 */
  const innerVisible = ref(false);

  const messageBoxContentRef = ref<HTMLElement>();

  function onAfterEnter() {
    emit('after-enter');
  }

  function onAfterLeave() {
    emit('after-leave');
  }

  const resolveConfirm = ref<(value: boolean) => void>();

  function onCancel() {
    if (!props.confirmButtonText) return;

    $close();
    emit('cancel');
    if (resolveConfirm.value) {
      resolveConfirm.value(false);
      resolveConfirm.value = undefined;
    }
  }

  function onConfirm() {
    $close();
    emit('confirm');
    if (resolveConfirm.value) {
      resolveConfirm.value(true);
      resolveConfirm.value = undefined;
    }
  }

  function $close() {
    innerVisible.value = false;
  }

  function $open() {
    innerVisible.value = true;
    if (messageBoxRef.value) {
      PlvPopperManager.openPopper(messageBoxRef.value);
    }
  }

  function $confirm() {
    $open();
    return new Promise<boolean>(resolve => {
      resolveConfirm.value = resolve;
    });
  }

  const messageBoxInstance: MessageBoxInstance = {
    $close,
    $open,
    $confirm,
  };

  function onLinkClick(a: HTMLAnchorElement) {
    emit('click-link', a);
  }

  onMounted(() => {
    const messageBoxContent = messageBoxContentRef.value;
    if (!messageBoxContent) return;

    messageBoxContent.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', event => {
        const isHttps = a.href.includes('https://');
        if (!isHttps) {
          console.warn('需要使用 http 协议的链接');
          return;
        }
        event.preventDefault();
        onLinkClick(event.target as HTMLAnchorElement);
      });
    });
  });

  return {
    innerVisible,

    messageBoxInstance,
    messageBoxRef,
    messageBoxContentRef,

    onAfterEnter,
    onAfterLeave,
    onCancel,
    onConfirm,
  };
};
