/**
 * @file 字幕设置本地存储管理
 */
import { SubtitleSourceTranslateLanguage } from '@polyv/live-watch-sdk';
import { getLocalStorage, setLocalStorage } from '@/assets/utils/storage';

/**
 * 字幕设置存储接口
 */
export interface SubtitleSettingsStorage {
  /** 实时字幕开关状态 */
  subtitleEnabled: boolean;
  /** 翻译语言 */
  translateLanguage: SubtitleSourceTranslateLanguage;
  /** 显示模式: 'all' | 'source' | 'translate' */
  displayMode: 'all' | 'source' | 'translate';
  /** 竖屏回放主字幕开关状态 */
  portraitReplayMainEnabled: boolean;
  /** 竖屏回放副字幕开关状态 */
  portraitReplaySubEnabled: boolean;
  /** 竖屏回放已选翻译字幕Id */
  portraitReplaySubtitleId: string;
}

/**
 * 存储键名
 */
const STORAGE_KEYS = {
  SUBTITLE_SETTINGS: 'subtitle-settings',
} as const;

/**
 * 默认设置
 */
const DEFAULT_SETTINGS: SubtitleSettingsStorage = {
  subtitleEnabled: true,
  translateLanguage: '' as SubtitleSourceTranslateLanguage,
  displayMode: 'all',
  portraitReplayMainEnabled: true,
  portraitReplaySubEnabled: true,
  portraitReplaySubtitleId: '',
};

/**
 * 获取字幕设置
 */
export function getSubtitleSettings(): SubtitleSettingsStorage {
  try {
    const stored = getLocalStorage(STORAGE_KEYS.SUBTITLE_SETTINGS);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<SubtitleSettingsStorage>;
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
      };
    }
  } catch (error) {
    console.warn('Failed to parse subtitle settings from localStorage:', error);
  }

  return { ...DEFAULT_SETTINGS };
}

/**
 * 保存字幕设置
 */
export function setSubtitleSettings(settings: Partial<SubtitleSettingsStorage>): void {
  try {
    const currentSettings = getSubtitleSettings();
    const newSettings = {
      ...currentSettings,
      ...settings,
    };

    setLocalStorage(STORAGE_KEYS.SUBTITLE_SETTINGS, JSON.stringify(newSettings));
  } catch (error) {
    console.error('Failed to save subtitle settings to localStorage:', error);
  }
}

/**
 * 重置字幕设置为默认值
 */
export function resetSubtitleSettings(): void {
  setSubtitleSettings(DEFAULT_SETTINGS);
}
