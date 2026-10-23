import { isMobile } from '@/assets/utils/browser';
import { VueProps } from '@polyv/vue-components';
import Vue from 'vue';
import MobileMessageBox from './mobile-message-box.vue';
import PcMessageBox from './pc-message-box.vue';
import { messageBoxCommonProps, MessageBoxInstance } from './use-message-box';

function getMessageBoxConstructor() {
  if (isMobile) {
    return MobileMessageBox;
  }

  return PcMessageBox;
}

export const messageBox = (props: Partial<VueProps<typeof messageBoxCommonProps>>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const __MessageBoxConstructor = Vue.extend(getMessageBoxConstructor() as any);
  const instance = new __MessageBoxConstructor({
    propsData: props,
  });
  instance.$mount();
  return instance as unknown as MessageBoxInstance;
};

export { PcMessageBox, MobileMessageBox };

export * from './use-message-box';
