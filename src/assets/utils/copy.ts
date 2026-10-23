import { useToastManager } from '@/hooks/components/use-toast';
import Clipboard from 'clipboard';
import { translate } from '../lang';

/**
 * 复制文本
 * @param text 复制内容
 */
export function copyText(text: string) {
  return new Promise((resolve, reject) => {
    const btnElm = document.createElement('button');
    btnElm.style.width = '0';
    btnElm.style.height = '0';
    const clipboard = new Clipboard(btnElm, {
      text: () => {
        return text;
      },
      action: () => {
        return 'copy';
      },
    });

    clipboard.on('success', function (e) {
      clipboard.destroy();
      document.body.removeChild(btnElm);
      resolve(e);
    });

    clipboard.on('error', function (e) {
      clipboard.destroy();
      document.body.removeChild(btnElm);
      reject(e);
    });

    document.body.appendChild(btnElm);
    btnElm.click();
  });
}

export const useCopyText = () => {
  const { toast } = useToastManager();

  /** 提示复制成功 */
  function toastCopySuccess() {
    toast.success(translate('copy.success'));
  }

  return {
    copyText,
    toastCopySuccess,
  };
};
