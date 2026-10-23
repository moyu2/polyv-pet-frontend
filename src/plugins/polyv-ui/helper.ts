import { PlvPopperManager } from './admin-import';

/** 用于还原原本的 zIndex 层级 */
let recordPopperZIndex: number | null = null;

/**
 * 强制更改弹出层管理器的 zIndex
 * @warn 会记录第一次触发时对应的 zIndex
 */
export function forceChangePlvPopperManagerZIndex(zIndex: number) {
  if (!recordPopperZIndex) {
    recordPopperZIndex = PlvPopperManager.zIndex;
  }
  PlvPopperManager.zIndex = zIndex;
}

/**
 * 还原弹出层管理器的 zIndex
 */
export function recoverPlvPopperManagerZIndex() {
  if (recordPopperZIndex) {
    PlvPopperManager.zIndex = recordPopperZIndex;
    recordPopperZIndex = null;
  }
}
