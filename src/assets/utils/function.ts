/**
 * 判断目标是否为函数类型
 * @param target 目标
 */
export function isFunction<T>(target: unknown): target is T {
  return typeof target === 'function';
}
