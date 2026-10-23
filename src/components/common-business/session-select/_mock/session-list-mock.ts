/**
 * 频道场次列表 mock 数据（仅供本地调试）
 *
 * 用法（在 use-session-select.ts 中临时替换 API 调用）：
 * ```ts
 * import { getMockChannelSessionList } from './_mock/session-list-mock';
 *
 * // 将 watchCore.channel.getChannelSessionList(...) 替换为：
 * const result = await getMockChannelSessionList({ pageNumber, pageSize, status, order });
 * ```
 */
import { ChannelSessionDataItem, ChannelSessionStatus, PageContent } from '@polyv/live-watch-sdk';

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

let idSeed = 1;
const nextId = () => String(idSeed++);

/**
 * 构造单条场次数据
 */
function makeSession(
  partial: Partial<ChannelSessionDataItem> & Pick<ChannelSessionDataItem, 'status'>,
): ChannelSessionDataItem {
  const now = Date.now();
  const status = partial.status;
  // 基于序号的时间偏移，保证每条数据 planStartTime 递增，排序才有区分度
  const offset = idSeed * 30 * MIN;

  const defaultTimeByStatus: Record<
    ChannelSessionStatus,
    Pick<
      ChannelSessionDataItem,
      'createdTime' | 'startTime' | 'endTime' | 'planStartTime' | 'planEndTime'
    >
  > = {
    [ChannelSessionStatus.Live]: {
      createdTime: now - 2 * HOUR + offset,
      planStartTime: now - 30 * MIN + offset,
      planEndTime: now + 90 * MIN + offset,
      startTime: now - 25 * MIN + offset,
      endTime: 0,
    },
    [ChannelSessionStatus.UnStart]: {
      createdTime: now - 5 * DAY + offset,
      planStartTime: now + 3 * DAY + offset,
      planEndTime: now + 3 * DAY + 2 * HOUR + offset,
      startTime: 0,
      endTime: 0,
    },
    [ChannelSessionStatus.Playback]: {
      createdTime: now - 10 * DAY + offset,
      planStartTime: now - 7 * DAY + offset,
      planEndTime: now - 7 * DAY + 2 * HOUR + offset,
      startTime: now - 7 * DAY + 5 * MIN + offset,
      endTime: now - 7 * DAY + 2 * HOUR + offset,
    },
    [ChannelSessionStatus.End]: {
      createdTime: now - 12 * DAY + offset,
      planStartTime: now - 9 * DAY + offset,
      planEndTime: now - 9 * DAY + 2 * HOUR + offset,
      startTime: now - 9 * DAY + 5 * MIN + offset,
      endTime: now - 9 * DAY + 110 * MIN + offset,
    },
    [ChannelSessionStatus.Expired]: {
      createdTime: now - 90 * DAY + offset,
      planStartTime: now - 80 * DAY + offset,
      planEndTime: now - 80 * DAY + 2 * HOUR + offset,
      startTime: now - 80 * DAY + 5 * MIN + offset,
      endTime: now - 80 * DAY + 2 * HOUR + offset,
    },
  };

  return {
    sessionId: nextId(),
    name: `场次-${partial.chapterName ? partial.chapterName + '-' : ''}${idSeed}`,
    splashImg: '',
    splashLargeImg: '',
    splashImgBackgroundId: 0,
    ...defaultTimeByStatus[status],
    ...partial,
  };
}

/**
 * 章节配置：12 个章节，每个章节数量不等，刻意让部分章节跨页拆分
 * （如 ch-1 有 15 条，pageSize=10 时第 1 页拿到 10 条、第 2 页拿到 5 条）
 */
const chapterConfigs: Array<{
  id: string;
  name: string;
  count: number;
  status: ChannelSessionStatus;
}> = [
  { id: 'ch-1', name: '架构篇', count: 15, status: ChannelSessionStatus.UnStart },
  { id: 'ch-2', name: '训练营', count: 12, status: ChannelSessionStatus.UnStart },
  { id: 'ch-3', name: '进阶系列', count: 10, status: ChannelSessionStatus.UnStart },
  { id: 'ch-4', name: '基础入门', count: 8, status: ChannelSessionStatus.UnStart },
  { id: 'ch-5', name: '实战演练', count: 12, status: ChannelSessionStatus.UnStart },
  { id: 'ch-6', name: '大咖分享', count: 6, status: ChannelSessionStatus.UnStart },
  { id: 'ch-7', name: '回放-技术大会', count: 14, status: ChannelSessionStatus.Playback },
  { id: 'ch-8', name: '回放-产品迭代', count: 10, status: ChannelSessionStatus.Playback },
  { id: 'ch-9', name: '回放-运营增长', count: 8, status: ChannelSessionStatus.Playback },
  { id: 'ch-10', name: '回放-设计美学', count: 6, status: ChannelSessionStatus.Playback },
  { id: 'ch-11', name: '回放-数据科学', count: 12, status: ChannelSessionStatus.Playback },
  { id: 'ch-12', name: '回放-安全合规', count: 5, status: ChannelSessionStatus.Playback },
];

/**
 * 生成全部 mock 场次（含各状态 + 12 个章节分组，数量充足以测试 loadMore 跨页 & 章节拆分）
 * 章节数据保持连续块状，无章节数据穿插在章节之间，确保每页都有混合数据
 */
function generateAllSessions(): ChannelSessionDataItem[] {
  // 先生成无章节数据队列
  const standaloneQueue: ChannelSessionDataItem[] = [];

  // 直播中 ×8（无章节）
  for (let i = 1; i <= 8; i++) {
    standaloneQueue.push(makeSession({ status: ChannelSessionStatus.Live, name: `直播场次 ${i}` }));
  }

  // 未开始（无章节）×15
  for (let i = 1; i <= 15; i++) {
    standaloneQueue.push(
      makeSession({ status: ChannelSessionStatus.UnStart, name: `预告场次 ${i}` }),
    );
  }

  // 回放（无章节）×10
  for (let i = 1; i <= 10; i++) {
    standaloneQueue.push(
      makeSession({ status: ChannelSessionStatus.Playback, name: `回放场次 ${i}` }),
    );
  }

  // 已结束 ×25
  for (let i = 1; i <= 25; i++) {
    standaloneQueue.push(
      makeSession({ status: ChannelSessionStatus.End, name: `已结束场次 ${i}` }),
    );
  }

  // 已过期 ×5
  for (let i = 1; i <= 5; i++) {
    standaloneQueue.push(
      makeSession({ status: ChannelSessionStatus.Expired, name: `历史归档 ${i}` }),
    );
  }

  // name 为 null/空 的脏数据（用于测试 filter 逻辑）
  standaloneQueue.push(
    makeSession({ status: ChannelSessionStatus.Live, name: '' as unknown as string }),
  );
  standaloneQueue.push(
    makeSession({ status: ChannelSessionStatus.Playback, name: null as unknown as string }),
  );

  // 按章节块状生成，章节之间穿插 2 条无章节数据
  let standaloneIdx = 0;
  const result: ChannelSessionDataItem[] = [];

  for (let ci = 0; ci < chapterConfigs.length; ci++) {
    const ch = chapterConfigs[ci];

    // 章节之间穿插 2 条无章节数据
    if (ci > 0) {
      for (let s = 0; s < 2 && standaloneIdx < standaloneQueue.length; s++) {
        result.push(standaloneQueue[standaloneIdx++]);
      }
    }

    // 章节数据作为连续块
    for (let i = 1; i <= ch.count; i++) {
      result.push(
        makeSession({
          status: ch.status,
          name: `${ch.name} 第${i}节`,
          chapterId: ch.id,
          chapterName: ch.name,
          sessionCount: ch.count,
        }),
      );
    }
  }

  // 追加剩余无章节数据
  while (standaloneIdx < standaloneQueue.length) {
    result.push(standaloneQueue[standaloneIdx++]);
  }

  return result;
}

const allSessions = generateAllSessions();

/**
 * 模拟 getChannelSessionList 接口，支持分页、状态过滤、排序
 *
 * @param params.pageNumber 页码（从 1 开始）
 * @param params.pageSize   每页条数
 * @param params.status     状态值（ChannelSessionStatus）
 * @param params.order      排序：planStartTimeDesc / planStartTimeAsc
 */
export function getMockChannelSessionList(
  params: {
    pageNumber?: number;
    pageSize?: number;
    status?: string;
    order?: string;
  } = {},
): Promise<PageContent<ChannelSessionDataItem>> {
  const { pageNumber = 1, pageSize = 10, status, order } = params;

  let data = [...allSessions];

  // 状态过滤
  if (status) {
    data = data.filter(item => item.status === status);
  }

  // 过滤空 name（与 use-session-select.ts 中 filter(item => item.name !== null) 一致）
  data = data.filter(item => item.name !== '' && item.name != null);

  // 排序
  if (order === 'planStartTimeAsc') {
    data.sort((a, b) => a.planStartTime - b.planStartTime);
  } else if (order === 'planStartTimeDesc') {
    data.sort((a, b) => b.planStartTime - a.planStartTime);
  }

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (pageNumber - 1) * pageSize;
  const contents = data.slice(start, start + pageSize);

  // 模拟网络延迟
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ pageNumber, pageSize, totalItems, totalPages, contents });
    }, 300);
  });
}

/**
 * 直接导出全部原始 mock 数据（不走分页/过滤，用于直接断言或快照）
 */
export const mockAllSessions: ChannelSessionDataItem[] = allSessions;
