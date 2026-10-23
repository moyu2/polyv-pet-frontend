/**
 * @file 跟数值有关的工具方法
 */

export function isNumber(target: unknown): target is number {
  return typeof target === 'number';
}

/**
 * 获取在指定范围的随机整数
 */
export function generateRandomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 保留小数位
 * @param number
 * @param accuracy 精度，选传，默认为 2
 */
export function numberToFixed(number: number, accuracy = 2): number {
  return Number(number.toFixed(accuracy));
}

/**
 * 保留数值的小数位，并转为字符串
 * @param num
 * @param accuracy 精度，默认：1
 */
export function numberAccuracy(num: number, accuracy = 1): string {
  const numStr = num.toString();
  const numStrList = numStr.split('.');
  const integerStr = numStrList[0];
  let decimalStr = numStrList[1] || '';
  decimalStr = decimalStr.padEnd(accuracy, '0');
  return `${integerStr}.${decimalStr}`;
}
