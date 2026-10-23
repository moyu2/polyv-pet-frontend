import { AreaData, AreaDataJson } from './types';

/**
 * 通过value与级联数据获取选择中的数据
 * @param value 绑定值
 * @param data 地区数据
 */
export function getSelectData(value: string[], data: AreaDataJson): AreaData[] {
  let res: AreaData[] = [];
  const [first, ...otherValue] = value;
  if (typeof first === 'undefined') {
    return res;
  }

  const selected = data.find(item => item.code === first);

  if (selected) {
    res = [selected];
  }

  if (selected && Array.isArray(selected.childrens)) {
    res = [...res, ...getSelectData(otherValue, selected.childrens as AreaDataJson)];
  }
  return res;
}

export function getAreaSelectNames(value: string[], data: AreaDataJson): string[] {
  const selectData = getSelectData(value, data);
  return selectData.map(item => item.name);
}

/**
 * 判断是否选择完成
 * @param value 已选值数组
 */
export function isSelectFinish(value: string[], data: AreaDataJson): boolean {
  const selectData = getSelectData(value, data);
  const lastData = selectData[selectData.length - 1] || {};

  return !!(selectData.length && (!lastData.childrens || !lastData.childrens.length));
}
