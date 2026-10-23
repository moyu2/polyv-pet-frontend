import type areaData from '@polyv/polyv-ui/resources/china-area.json';

export interface ImagePreviewOptions {
  /** 模式显示的下标 */
  initialIndex?: number;
}

export interface AreaData {
  name: string;
  code: string;
  childrens?: AreaData[];
}

export type AreaDataJson = typeof areaData;

export interface AreaPickerComponent {
  /** 通过value与级联数据获取选择中的数据 */
  getSelectData: (value: string[], areaData: object) => AreaData[];
  /** 是否已选择完成 */
  isSelectFinish: (value: string[], areaData: object) => boolean;
  /** 加载中国地区数据 */
  loadAreaDataUrl: () => Promise<AreaDataJson>;
}

/**
 * 点赞动画选项
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LikeAnimationOptions {}

/**
 * 点赞组件实例
 */
export interface PlvLikeInstance {
  /** 插入动画 */
  pushAnimation: (options?: LikeAnimationOptions) => void;
}

/**
 * 情绪反馈组件实例
 */
export interface PlvEmotionalFeedbackInstance {
  /** 开始一个动画 */
  start: (type: number, arg: true) => void;
}

/**
 * 轮播组件实例
 */
export interface PlvCarouselInstance {
  handleWindowReszie?: () => void;
}

export interface PlvInputContentText {
  type: 'text';
  content: string;
}

export interface PlvInputContentImage {
  type: 'img';
  file: File;
}

export type PlvInputContent = PlvInputContentText | PlvInputContentImage;

export interface PlvInputImagePasteInstance {
  /** 输入框聚焦 */
  focus: () => void;
  /** 插入表情 */
  insertEmotion: (emotion: string) => void;
  /** 获取内容列表 */
  getContentList: () => PlvInputContent[];
  /** 清除输入框内容 */
  clear: () => void;
  /** 组件实例的 HTML 元素 */
  $el: HTMLElement;
}
