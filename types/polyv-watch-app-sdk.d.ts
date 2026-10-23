/**
 * @file 声明 PolyvWatchAppSdk 相关类型
 */

import type { PolyvWatchAppClass } from '@/plugins/sdk-inject-helper';
import type { EventEmitter } from '@polyv/utils/event';

type PolyvWatchAppSdkEventRelations = {
  init: void;
};

declare global {
  type PolyvWatchAppSdkType =
    /** sdk-inject-project 注入 */
    {
      eventEmitter: EventEmitter<
        PolyvWatchAppSdkEventRelations,
        keyof PolyvWatchAppSdkEventRelations
      >;
      loadPolyvWatchAppSource: (opts?: { publicPath?: string }) => void;
      publicPath?: string;
    } & /** main 注入 */ {
      createPolyvWatchApp(opts: { id: string }): PolyvWatchAppClass;
    } /** 外部容器注入 */ & {
      getActivePolyvWatchApp: () => PolyvWatchAppClass | undefined;
      getPolyvWatchApp(id: string): PolyvWatchAppClass;
    };

  type CreatePolyvWatchAppParams = Parameters<PolyvWatchAppSdkType['createPolyvWatchApp']>[0];

  interface Window extends Record<string, unknown> {
    PolyvWatchAppSdk?: PolyvWatchAppSdkType;
  }
}
