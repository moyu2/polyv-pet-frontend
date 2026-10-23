/**
 * 创建字符串元组
 */
export const tupleString = <T extends string[]>(...args: T): T => args;

export function isArray<T extends unknown[]>(target: unknown): target is T {
  return Array.isArray(target);
}
