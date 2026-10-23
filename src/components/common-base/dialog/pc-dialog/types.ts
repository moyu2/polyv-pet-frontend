export interface DialogInstance {
  /** 重置位置 */
  resetPosition(): void;
  setMountEl(): void;
  handleDocumentEventToReset(): void;
}
