/**
 * @file 打赏 store
 */
import { translate } from '@/assets/lang';
import { useChannelStore } from '@/store/use-channel-store';
import { DonateGoodData, DonateType, PayDonateData, YN } from '@polyv/live-watch-sdk';
import { ynToBool } from '@polyv/utils/boolean';
import { defineStore } from 'pinia';
import { ComputedRef, Ref, computed, ref, unref } from 'vue';
import { usePlaybackStore } from './use-playback-store';
import { useWatchAppStore } from './use-watch-app-store';
import { useResizeOssImage } from '@polyv/vue-components';

export interface DonateGoodInfo extends DonateGoodData {
  /** 翻译后的礼物名称 */
  goodTranslateName: string;
  /** 礼物价格文案 */
  goodPriceText: string;
  /** 礼物类型 */
  donateType: DonateType.Good;
}

type DonatePageItem =
  | DonateGoodInfo
  | {
      donateType: DonateType.Cash;
    };

export interface DonateStoreState {
  /** 是否显示现金打赏 */
  showDonateCash: Ref<boolean>;
  /** 是否显示现金道具打赏 */
  showDonateCashGood: Ref<boolean>;
  /** 是否显示积分道具打赏 */
  showDonatePointGood: Ref<boolean>;
  /** 是否显示道具打赏 */
  showDonateGifts: ComputedRef<boolean>;
  /** 是否显示打赏功能 */
  showDonateFunction: ComputedRef<boolean>;
  /** 现金打赏最低的打赏金额 */
  donateCashMin: Ref<number>;
  /** 现金打赏快捷选项 */
  donateCashQuickOptions: Ref<number[]>;
  /** 积分打赏礼物单位 */
  donatePointUnit: Ref<string | undefined>;
  /** 可以显示的打赏道具列表 */
  donateItemList: ComputedRef<DonateGoodInfo[]>;
  /** 将道具、现金打赏进行分页 */
  donateContentPages: ComputedRef<DonatePageItem[][]>;
  /** PC 端下当前待支付的打赏数据 */
  waitPayDonateData: Ref<PayDonateData | undefined>;
  /** 是否显示其他人的打赏特效 */
  donateAnimationVisible: Ref<boolean>;
}

export interface DonateStoreAction {
  /** 翻译打赏道具的道具名 */
  translateGoodName: (goodName: string) => string;
  /** 获取打赏道具的价格文案 */
  getGoodPriceText: (goodPrice: string) => string;
  /** 根据道具id获取打赏道具信息 */
  findDonateGoodById: (targetGoodId?: string) => DonateGoodInfo | undefined;
  /** 同步打赏 Store */
  syncDonateStore: () => void;
}

export interface DonateStore extends DonateStoreState, DonateStoreAction {}

export const useDonateStore = defineStore<'donate', DonateStore>('donate', () => {
  const watchAppStore = useWatchAppStore();
  const channelStore = useChannelStore();
  const playbackStore = usePlaybackStore();

  const { resizeOSSImg } = useResizeOssImage();

  /** 道具礼物中英文 */
  const goodNamesConfig = computed<UniversalParams<string>>(() => {
    return {
      666: translate('donate.name.six'),
      小熊: translate('donate.name.bear'),
      麦克风: translate('donate.name.microphone'),
      别墅: translate('donate.name.villa'),
      咖啡: translate('donate.name.coffee'),
      奖杯: translate('donate.name.trophy'),
      小星星: translate('donate.name.star'),
      掌声: translate('donate.name.applause'),
      游艇: translate('donate.name.yacht'),
      火箭: translate('donate.name.rocket'),
      点赞: translate('donate.name.like'),
      烟火: translate('donate.name.fireworks'),
      皇冠: translate('donate.name.crown'),
      跑车: translate('donate.name.cars'),
      金蛋: translate('donate.name.goldenEggs'),
      钻石: translate('donate.name.diamonds'),
      飞机: translate('donate.name.plane'),
      鲜花: translate('donate.name.flower'),
    };
  });

  /** 是否显示现金打赏 */
  const showDonateCash = ref(false);

  /** 是否显示现金道具打赏 */
  const showDonateCashGood = ref(false);

  /** 是否显示积分道具打赏 */
  const showDonatePointGood = ref(false);

  /** 是否显示道具打赏 */
  const showDonateGifts = computed(() => {
    return unref(showDonateCashGood) || unref(showDonatePointGood);
  });

  /** 是否显示打赏功能 */
  const showDonateFunction = computed(() => {
    if (watchAppStore.isPlaybackWatchUrl) return false;
    if (channelStore.isSeminarChannel) return false;
    if (playbackStore.chatMsgReplayEnabled) return false;

    return unref(showDonateCash) || unref(showDonateGifts);
  });

  /** 现金打赏最低的打赏金额 */
  const donateCashMin = ref(0);

  /** 现金打赏快捷选项 */
  const donateCashQuickOptions = ref<number[]>([]);

  /** 积分打赏礼物单位 */
  const donatePointUnit = ref('');

  const __donateItemAll = ref<DonateGoodInfo[]>([]);

  /** 所有打赏道具列表 */
  const donateItemAll = computed<DonateGoodInfo[]>(() => {
    return __donateItemAll.value.map(good => {
      return {
        ...good,
        goodImage: resizeOSSImg(good.goodImage),
        goodTranslateName: translateGoodName(good.goodName),
        goodPriceText: getGoodPriceText(good.goodPrice),
      };
    });
  });

  /**
   * 可以显示的打赏道具列表
   * @desc PC 端打赏列表
   * */
  const donateItemList = computed<DonateGoodInfo[]>(() => {
    return donateItemAll.value.filter(good => ynToBool(good.goodEnabled, YN.N));
  });

  /**
   * 将道具、现金打赏进行分页
   * @desc 移动端打赏列表
   * */
  const donateContentPages = computed<DonatePageItem[][]>(() => {
    // 所有打赏种类，道具+现金
    const donateList: DonatePageItem[] = [];

    // 插入礼物打赏节点（含现金、积分礼物）
    if (unref(showDonateGifts)) {
      donateList.push(...unref(donateItemList));
    }

    // 插入现金打赏节点
    if (unref(showDonateCash)) {
      donateList.push({
        donateType: DonateType.Cash,
      });
    }

    const pages: DonatePageItem[][] = [];
    const totalPages = Math.ceil(donateList.length / 10);
    for (let i = 0; i < totalPages; i++) {
      pages.push(donateList.slice(i * 10, i * 10 + 10));
    }

    return pages;
  });

  /** PC 端下当前待支付的打赏数据 */
  const waitPayDonateData = ref<PayDonateData>();

  /** 是否显示其他人的打赏特效 */
  const donateAnimationVisible = ref(true);

  /** 翻译打赏道具的道具名 */
  function translateGoodName(goodName: string): string {
    const translateName = unref(goodNamesConfig)[goodName];

    if (translateName) {
      return translateName;
    }

    return goodName;
  }

  /** 获取打赏道具的价格文案 */
  function getGoodPriceText(goodPrice: string | number): string {
    if (!goodPrice) return translate('donate.free');

    if (unref(showDonateCashGood)) {
      return `￥${goodPrice}`;
    }

    return `${goodPrice} ${unref(donatePointUnit) || translate('donate.spot')}`;
  }

  /**
   * 根据道具id获取打赏道具信息
   */
  function findDonateGoodById(targetGoodId?: string): DonateGoodInfo | undefined {
    return donateItemList.value.find(good => good.goodId === targetGoodId);
  }

  /**
   * 同步打赏 Store 数据
   */
  function syncDonateStore() {
    const watchCore = watchAppStore.getWatchCore();

    showDonateCash.value = watchCore.donate.isShowDonateCash();
    showDonateCashGood.value = watchCore.donate.isShowDonateCashGood();
    showDonatePointGood.value = watchCore.donate.isShowDonatePointGood();

    const donateConfig = watchCore.donate.getDonateConfig();

    donateCashMin.value = donateConfig.donateCashMin;
    donateCashQuickOptions.value = donateConfig.donateCashQuickOptions;
    donatePointUnit.value = donateConfig.donatePointUnit;

    __initDonateItemAll();
  }

  /** 初始化所有打赏道具列表 */
  function __initDonateItemAll() {
    const watchCore = watchAppStore.getWatchCore();
    const { goods } = watchCore.donate.getDonateGoods();

    __donateItemAll.value = goods.map<DonateGoodInfo>(good => {
      return {
        ...good,
        goodTranslateName: translateGoodName(good.goodName),
        goodPriceText: getGoodPriceText(good.goodPrice),
        donateType: DonateType.Good,
      };
    });
  }

  return {
    donateCashMin,
    donateCashQuickOptions,
    showDonateCash,
    showDonateCashGood,
    showDonatePointGood,
    showDonateGifts,
    showDonateFunction,
    donatePointUnit,
    donateItemList,
    donateContentPages,

    waitPayDonateData,
    donateAnimationVisible,

    translateGoodName,
    getGoodPriceText,
    findDonateGoodById,
    syncDonateStore,
  };
});
