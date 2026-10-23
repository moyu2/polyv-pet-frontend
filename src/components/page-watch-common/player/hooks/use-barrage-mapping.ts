/**
 * @file 弹幕设置数据值与滑块值双向映射
 */
class BidirectionalMap {
  /**
   * 双射正向关系表
   * @warn key与value值需要唯一
   * @private
   */
  private fwdMap: UniversalParams<string>;

  /**
   * 双射反向关系表
   * @warn key与value值需要唯一
   * @private
   */
  private revMap: UniversalParams<string>;

  constructor(map: UniversalParams<string>) {
    /** 正向表 */
    this.fwdMap = { ...map };
    /** 反向表 */
    this.revMap = Object.keys(map).reduce(
      (acc, cur) => ({
        ...acc,
        [map[cur]]: cur,
      }),
      {},
    );
  }

  /**
   * 查询值
   * @param key {number|string}
   * @return {number}
   */
  get(key: number | string): number {
    let _key = key;

    if (typeof key !== 'string') {
      _key = `${key}`;
    }

    const _value = this.fwdMap[_key] || this.revMap[key];

    return Number(_value);
  }
}

/**
 * 弹幕速度档位置
 */
export const speedGear = {
  '340': '1',
  '270': '2',
  '200': '3',
  '130': '4',
  '60': '5',
};

/**
 * 弹幕速度&等级映射
 * @type {BidirectionalMap}
 */
export const speedBitMap = new BidirectionalMap(speedGear);

/**
 * PC端弹幕字号档位值
 */
export const pcSizeGear = {
  '12': '1',
  '14': '2',
  '20': '3',
  '28': '4',
  '32': '5',
};

/**
 * 弹幕字号大小&等级映射（PC端）
 * @type {BidirectionalMap}
 */
export const sizeBitMap = new BidirectionalMap(pcSizeGear);

/**
 * H5端弹幕字号档位值
 */
export const mobileSizeGear = {
  '12': '1',
  '14': '2',
  '16': '3',
  '22': '4',
  '28': '5',
};

/**
 * 弹幕字号大小&等级映射（移动端）
 * @type {BidirectionalMap}
 */
export const sizeMobileBitMap = new BidirectionalMap(mobileSizeGear);
