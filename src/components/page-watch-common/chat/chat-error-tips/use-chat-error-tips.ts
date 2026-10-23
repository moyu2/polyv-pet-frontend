import { PropUtils } from '@polyv/vue-components';
import { ref } from 'vue';

export const chatErrorTipsProps = () => ({
  /** 提示内容 */
  content: PropUtils.string.def(''),
  /** 是否显示关闭按钮 */
  closable: PropUtils.bool.def(true),
});

export const useChatErrorTips = () => {
  /** 提示显示状态 */
  const showTips = ref(true);

  /** 处理点击关闭 */
  function onClickClose() {
    showTips.value = false;
  }

  return {
    showTips,
    onClickClose,
  };
};
