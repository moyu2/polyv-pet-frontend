import Vue, { ref } from 'vue';
import SingleChatMsgTips from '../single-chat-msg-tips.vue';
import {
  singleChatMsgTipsInstance,
  singleChatMsgTipsVueInstanceType,
  SingleChatMsgTipsOptions,
} from '../_types/index';

let instance: singleChatMsgTipsVueInstanceType;

export const useSingleChatMsgTips = () => {
  const singleChatMsgTipsInstance = ref<singleChatMsgTipsInstance>();

  function createChatMsgTips(options: SingleChatMsgTipsOptions): singleChatMsgTipsInstance {
    const __ContextMenuConstructor = Vue.extend(SingleChatMsgTips);

    if (instance) {
      instance.$updateItemData(options);
      instance.$forceUpdate();
    } else {
      instance = new __ContextMenuConstructor();

      instance.$mount();
      instance.$updateItemData(options);

      singleChatMsgTipsInstance.value = instance as unknown as singleChatMsgTipsInstance;
    }

    return instance;
  }

  return {
    singleChatMsgTipsInstance,
    createChatMsgTips,
  };
};
