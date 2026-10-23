import { SelectOptionItem } from '../form-select/types/form-select-types';

/**
 * 格式化字符串数组下拉选项
 */
export function formatSimpleSelectOptions(options: string[]): SelectOptionItem[] {
  const strList = options.filter(str => !!str);
  return strList.map<SelectOptionItem>(str => {
    return {
      label: str,
      value: str,
    };
  });
}
