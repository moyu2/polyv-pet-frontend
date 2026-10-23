import { local, session } from '@polyv/utils/storage';

/**
 * Storage 存储 key 前缀
 */
export const STORAGE_KEY_PREFIX = 'plv-live-watch-sdk-';

/**
 * 获取 storage 的完整 key
 * @param suffix 后缀
 */
export function getStorageKey(suffix: string): string {
  return `${STORAGE_KEY_PREFIX}${suffix}`;
}

/**
 * 设置 localStorage
 * @param key
 * @param value
 */
export function setLocalStorage(key: string, value: string): void {
  local.set(getStorageKey(key), value);
}

/**
 * 获取 localStorage
 * @param key
 * @returns
 */
export function getLocalStorage(key: string): string | null {
  return local.get(getStorageKey(key));
}

/**
 * 设置 sessionStorage
 * @param key
 * @param value
 */
export function setSessionStorage(key: string, value: string): void {
  session.set(getStorageKey(key), value);
}

/**
 * 获取 sessionStorage
 * @param key
 * @returns
 */
export function getSessionStorage(key: string): string | null {
  return session.get(getStorageKey(key));
}

/**
 * 移除 sessionStorage
 * @param key
 */
export function removeSessionStorage(key: string): void {
  session.remove(getStorageKey(key));
}
