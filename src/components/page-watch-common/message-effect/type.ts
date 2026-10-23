/**
 * 消息特效类型
 */
export enum MessageEffectType {
  /**
   * 用户访问
   */
  JoinVisit = 'JoinVisit',
  /**
   * 商品点击
   */
  ProductClick = 'ProductClick',
  /**
   * 商品下单
   */
  ProductBuy = 'ProductBuy',
  /**
   * 用户签到
   */
  CheckIn = 'CheckIn',
  /**
   * 打赏
   */
  Donate = 'Donate',
}

/**
 * 消息特效数据
 */
export interface MessageEffectData {
  id: string;
  /**
   * 特效类型
   */
  effectType: MessageEffectType;
  /**
   * 昵称列表
   */
  nicknames: string[];
  /**
   * 昵称数量
   */
  nicknameCount: number;
  /**
   * 目标 id
   */
  targetId: string | number;
  /**
   * 目标名称
   */
  targetName: string;
  /**
   * 目标数量
   */
  targetCount?: number;
  /**
   * 目标图片
   */
  targetImage?: string;
  /**
   * 商品类消息的商品类型
   */
  productType?: string;
  /**
   * 字符串模板
   */
  strTemplate: string;
}

/**
 * 文字类型，normal-普通文字，nickname-用户昵称，productName-商品名称
 */
export type EffectTextType = 'normal' | 'nickname' | 'productName' | 'donateName';

/**
 * 消息特效文字节点
 */
export interface MessageEffectTextItem {
  /**
   * 文字类型
   */
  textType: EffectTextType;
  /**
   * 文字内容
   */
  text: string;
  /**
   * 数量
   */
  count?: number;
  /**
   * 图片
   */
  image?: string;
}
