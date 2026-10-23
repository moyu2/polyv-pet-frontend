/**
 * @file 调试用颜色列表常量
 */

/**
 * 调试面板中可选的颜色列表
 */
export const DEBUG_COLOR_LIST: DebugColorList = [
  { label: '黑色', value: '#202127' },
  { label: '浅蓝', value: '#D1E3F9' },
  { label: '鲜蓝', value: '#2275dd' },
  { label: '亮蓝', value: '#69C5FF' },
  { label: '绿色', value: '#398775' },
  { label: '深红', value: '#a20a1f' },
  { label: '浅灰', value: '#f2f2f2' },
  { label: '蓝色', value: '#3F76FC' },
  { label: '金色', value: '#D8A83A' },
  { label: '绿系', value: '#33C89E' },
  { label: '亮红', value: '#FF5252' },
];

export type DebugColorListItem = { label: string; value: string };

/**
 * 调试颜色列表类型
 */
export type DebugColorList = DebugColorListItem[];

/**
 * 默认主题色
 */
export const DEFAULT_THEME_COLOR = '#202127';

/**
 * 默认主要色
 */
export const DEFAULT_PRIMARY_COLOR = '#3F76FC';

/**
 * 默认蒙层透明度
 */
export const DEFAULT_THEME_MASK_OPACITY = 0.4;
