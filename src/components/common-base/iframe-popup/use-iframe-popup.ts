import { PropUtils, VueProps, VueEmit, emitFunc } from '@polyv/vue-components';
import { iframeRenderProps } from '../iframe-render/use-iframe-render';

export const iframePopupProps = () => ({
  value: PropUtils.bool.def(false),
  ...iframeRenderProps(),
});

export const iframePopupEmits = () => ({
  input: emitFunc<boolean>(),
});

export const useIframePopup = (options: {
  props: VueProps<typeof iframePopupProps>;
  emit: VueEmit<typeof iframePopupEmits>;
}) => {
  const { emit } = options;

  function close() {
    emit('input', false);
  }

  return {
    close,
  };
};
