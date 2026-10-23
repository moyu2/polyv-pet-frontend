export enum ComponentLayoutType {
  /** 一行两个 */
  TwoPerRow = 'TwoPerRow',
  /** 一行三个 */
  ThreePerRow = 'ThreePerRow',
  /** 一行四个 */
  FourPerRow = 'FourPerRow',
  /** 一行五个 */
  FivePerRow = 'FivePerRow',

  /** 大图 */
  LargeImage = 'LargeImage',
  /** 横向滑动 */
  HorizontalScroll = 'HorizontalScroll',
  /** 瀑布流 */
  Waterfall = 'Waterfall',

  /**
   * 多行平铺
   * @desc 根据 item 的宽度平铺布局，自动换行
   */
  RowWrap = 'RowWrap',
  /**
   * 详细列表布局
   */
  DetailList = 'DetailList',
  /**
   * 详细列表布局（横向）
   */
  DetailListHorizontal = 'DetailListHorizontal',
}
