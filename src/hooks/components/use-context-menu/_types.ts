import type { IconComponentOption } from '@polyv/icons-vue-middle/icon-builder';
import Vue from 'vue';
import { CombinedVueInstance } from 'vue/types/vue';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ContextMenuData<ExtData = any> {
  hidden?: boolean;
  getIcon?: () => IconComponentOption;
  content: string;
  onClick: (menuItem: ContextMenuData<ExtData>) => void;
  /** 额外携带数据 */
  ext?: ExtData;
}

export interface ContextMenuPosition {
  x: number;
  y: number;
  offsetX?: number;
  offsetY?: number;
}

export interface ContextMenuInstance {
  /** 更新菜单数据 */
  $updateMenuData: (data: ContextMenuData[]) => void;
  /** 更新菜单位置 */
  $updatePosition: (position: ContextMenuPosition) => void;
}

export type ContextMenuVueInstanceType = CombinedVueInstance<
  Vue,
  Record<string, never>,
  ContextMenuInstance,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>;
