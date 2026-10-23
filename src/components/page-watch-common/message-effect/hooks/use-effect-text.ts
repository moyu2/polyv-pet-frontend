import { useLangStore } from '@/store/use-lang-store';
import { EffectTextType, MessageEffectData, MessageEffectTextItem } from '../type';
import { translate } from '@/assets/lang';

export const useEffectText = (
  options: {
    /** 是否截取昵称 */
    sliceNickname?: boolean;
  } = {},
) => {
  const { sliceNickname = true } = options;

  const langStore = useLangStore();

  /**
   * 格式化字符串模板
   * @param template 字符串模板
   */
  function parseTemplateString(template: string) {
    const result: Array<{ textType: EffectTextType; text: string }> = [];
    const regex = /\{\{(.*?)\}\}|([^{]+)/g;
    let match;

    while ((match = regex.exec(template)) !== null) {
      if (match[1]) {
        // 捕获 {{key}} 的情况
        result.push({
          textType: match[1] as EffectTextType,
          text: match[1],
        });
      } else if (match[2]) {
        // 捕获普通文本的情况
        result.push({
          textType: 'normal',
          text: match[2],
        });
      }
    }

    return result;
  }

  function sliceText(text: string) {
    if (text.length > 5) {
      return text.slice(0, 5) + '...';
    }
    return text;
  }

  function getEffectText(data: MessageEffectData) {
    const strList = parseTemplateString(data.strTemplate);
    const result: MessageEffectTextItem[] = [];

    const nicknames = data.nicknames.map(text => {
      text = langStore.translateNick(text);
      if (sliceNickname) {
        text = sliceText(text);
      }
      return text;
    });

    strList.forEach(item => {
      switch (item.textType) {
        case 'normal':
          result.push({
            textType: item.textType,
            text: item.text,
          });
          break;
        case 'nickname':
          result.push({
            textType: item.textType,
            text: nicknames.join('、'),
            count: data.nicknameCount,
          });
          break;
        case 'productName':
          result.push({
            textType: item.textType,
            text: sliceText(data.targetName),
          });
          break;
        case 'donateName':
          result.push({
            textType: item.textType,
            text: sliceText(data.targetName),
            image: data.targetImage,
          });
          break;
      }
    });
    return result;
  }

  function getNicknameCountText(count: number) {
    return translate('effect.peopleCount', { count });
  }

  return {
    parseTemplateString,
    getEffectText,
    getNicknameCountText,
  };
};
