/**
 * @file 延迟设置本地存储管理
 */
import { getLocalStorage, setLocalStorage } from '@/assets/utils/storage';

/**
 * 延迟设置存储接口
 */
export interface LatencySettingsStorage {
  /** 是否为低延迟模式 */
  isLowLatency: boolean;
}

/**
 * 存储键名
 */
const STORAGE_KEYS = {
  LATENCY_SETTINGS: 'latency-settings',
} as const;

/**
 * 默认设置
 */
const DEFAULT_SETTINGS: LatencySettingsStorage = {
  isLowLatency: true, // 默认无延迟
};

/**
 * 获取延迟设置
 */
export function getLatencySettings(): LatencySettingsStorage {
  try {
    const stored = getLocalStorage(STORAGE_KEYS.LATENCY_SETTINGS);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<LatencySettingsStorage>;
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
      };
    }
  } catch (error) {
    console.warn('Failed to parse latency settings from localStorage:', error);
  }

  return { ...DEFAULT_SETTINGS };
}

/**
 * 保存延迟设置
 */
export function setLatencySettings(settings: Partial<LatencySettingsStorage>): void {
  try {
    const currentSettings = getLatencySettings();
    const newSettings = {
      ...currentSettings,
      ...settings,
    };

    setLocalStorage(STORAGE_KEYS.LATENCY_SETTINGS, JSON.stringify(newSettings));
  } catch (error) {
    console.error('Failed to save latency settings to localStorage:', error);
  }
}

/**
 * 重置延迟设置为默认值
 */
export function resetLatencySettings(): void {
  setLatencySettings(DEFAULT_SETTINGS);
}
