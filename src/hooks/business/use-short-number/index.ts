import { LangType } from '@/assets/lang/lang-enum';
import { useLangStore } from '@/store/use-lang-store';

export const useShortNumber = () => {
  const langStore = useLangStore();

  /**
   * 缩减数值
   */
  function __shortNumber(num: number, unit: 'w' | 'k' = 'w') {
    const maxNumMap = {
      w: 10000,
      k: 1000,
    };

    const maxNum = maxNumMap[unit];
    if (num >= maxNum) {
      let shortNumStr = (num / maxNum).toFixed(1);
      const [intNum, dotNum] = shortNumStr.split('.');
      shortNumStr = Number(dotNum) === 0 ? intNum : shortNumStr;
      return shortNumStr + unit;
    } else {
      return num.toString();
    }
  }

  /**
   * 根据当前语言缩短数值
   * @param num 数值
   */
  function shortNumber(num: number) {
    const unit = langStore.currentLang === LangType.ZH_CN ? 'w' : 'k';

    return __shortNumber(num, unit);
  }

  return {
    shortNumber,
  };
};
