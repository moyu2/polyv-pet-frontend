export type ActionSheetValue = string | number;

export interface ActionSheetItem {
  /** 名称 */
  name: string;
  /** 选项值 */
  value: ActionSheetValue;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否展示加载态 */
  loading?: boolean;
}
