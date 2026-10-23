/**
 * 互动接收端商品列表 vue 实例类型
 */
export interface IarAnnouncementInstance {
  /** 标记公告已读 */
  markAnnounceReaded: () => void;
  /** 显示公告列表 */
  showBulletinList: () => void;
  /** 显示公告详情 */
  showBulletinDetail: (detail: unknown) => void;
}
