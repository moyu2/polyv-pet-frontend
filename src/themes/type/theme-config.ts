import { ThemeColorMode } from './theme-color-mode';
import { LikeEffectType } from '@polyv/live-watch-sdk';

/**
 * type 为 'background-image' 时， url 优先级大于 gradient
 * type 为 'border-image' 时，只有 url 生效
 * type 为 'background-color' 时，只有 color 字段生效
 */
export interface BgConfig {
  /** 背景类型 */
  type: 'border-image' | 'background-image' | 'background-color';
  /** 背景图片 */
  url?: string;
  /** 渐变值 */
  gradient?: string;
  /** 背景颜色 */
  color?: string;
  /** 其他 CSS 背景属性样式 */
  style: object;
}

export interface WatchThemeStyleConfig {
  mode: ThemeColorMode;
  themeColor: string;
  primaryColor: string;
  themeMaskOpacity: number;
  common: Common;
  mobile: Mobile;
  pc?: PC;
  portrait: Portrait;
}

export interface Common {
  player: Player;
  chat: CommonChat;
  introArea: IntroArea;
  normalBtn: NormalBtn;
  pendant: Pendant;
}

export interface IntroArea {
  bgConfig: BgConfig;
}

export interface CommonChat {
  msgInput: MsgInput;
  btn: Btn;
}

export interface Btn {
  donate: {
    iconUrl: string;
  };
  cart: {
    iconUrl: string;
    countVisible: boolean;
  };
  like: {
    iconUrl: string;
    countBg: string;
    countColor: string;
    effectType: LikeEffectType;
    effectIcons?: string[];
  };
  more: {
    iconUrl: string;
  };
}

export interface MsgInput {
  bgConfig: BgConfig;
  borderColor: string;
}

export interface NormalBtn {
  bgConfig: BgConfig;
  borderColor: string;
  color: string;
}

export interface Pendant {
  pushCardForQrCode: string;
  pushCardForNormal: string;
  coupon: string;
  feedback: string;
  lottery: string;
  conditionLottery: string;
  luckyLottery: string;
  invitePoster: string;
  redPacketRain: string;
  redPacketPwd: string;
  redPacket: string;
  taskPrizeEn: string;
  taskPrizeZh: string;
  topicPk: string;
  vote: string;
}

export interface SubscribeArea {
  bgConfig: BgConfig;
  countBg: string;
  countColor: string;
}

export interface Style {
  'border-image-slice': string;
  'border-image-width': string;
}

export interface Mobile {
  splash: MobileSplash;
  menu: Menu;
  chat: MobileChat;
  follow?: Follow;
}

export interface PC {
  menu: Menu;
  bgConfig: BgConfig;
}

export interface Follow {
  color: string;
  bgConfig: BgConfig;
}

interface MobileSplash {
  subscribeArea: SubscribeArea;
}

export interface Portrait {
  chat: MobileChat;
}
export interface MobileChat {
  bgConfig: BgConfig;
}

export interface Menu {
  bgConfig: BgConfig;
  item: {
    fontColor: string;
  };
  activeItem: {
    bgConfig: BgConfig;
    borderColor: string;
    icon: string;
    fontColor: string;
    underline: boolean;
  };
}

export interface Player {
  cover: string;
}
