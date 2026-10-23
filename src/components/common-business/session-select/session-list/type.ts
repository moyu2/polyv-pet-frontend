import { tupleString } from '@/assets/utils/array';
import type { ChannelSessionDataItem } from '@polyv/live-watch-sdk';

export const SessionListItemSizeList = tupleString(
  'normal',
  'large',
  'large_auto',
  'medium',
  'medium_auto',
  'small',
  'detail_list',
  'detail_list_horizontal',
);

export type SessionListItemSize = typeof SessionListItemSizeList[number];

export enum ChannelNameDisplayType {
  Hide = 'hide',
  OneRow = 'oneRow',
  TwoRow = 'twoRow',
}

export interface SessionChapter {
  /** null 表示无章节的末尾分组 */
  chapterId: string | null;
  chapterName: string;
  sessionCount: number;
  sessions: ChannelSessionDataItem[];
}

export interface SessionBookingChangeData {
  sessionId: string;
  smsBooked?: boolean | null;
  wxBooked?: boolean | null;
  customBooked?: boolean | null;
}
