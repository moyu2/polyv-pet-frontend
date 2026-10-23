export type SelectValueType = string | number | boolean;

export interface SelectOptionItem {
  /** 显示的文案 */
  label: string;
  /** 绑定值 */
  value: SelectValueType;
}
