import { CombinedVueInstance } from 'vue/types/vue';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SingleChatMsgTipsData<ExtData = any> {
  hidden?: boolean;
  content: string;
  onClick: (msgTipsItem: SingleChatMsgTipsData<ExtData>) => void;
  /** 额外携带数据 */
  ext?: ExtData;
}

export interface SingleChatMsgTipsOriginPosition {
  x: number;
  y: number;
}

export interface SingleChatMsgTipsOptions {
  target: HTMLDivElement;
  originPosition: SingleChatMsgTipsOriginPosition;
  mountEl: string;
  itemData: SingleChatMsgTipsData[];
}

export type SingleChatMsgTipsOriginOptions = Pick<
  SingleChatMsgTipsOptions,
  'target' | 'mountEl' | 'originPosition'
>;

export type singleChatMsgTipsVueInstanceType = CombinedVueInstance<
  Vue,
  Record<string, never>,
  singleChatMsgTipsInstance,
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
>;

export interface singleChatMsgTipsInstance {
  $hideTips: () => void;
  $updateItemData: (options: SingleChatMsgTipsOptions) => void;
}

export interface SingleTipsPosition {
  x: number;
  y: number;
  offsetX?: number;
  offsetY?: number;
}
