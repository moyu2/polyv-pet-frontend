/* eslint-disable @typescript-eslint/no-explicit-any */
import { onBeforeUnmount, onMounted, readonly } from 'vue';
import { EventEmitter } from '@polyv/utils/event';
import { events } from './events/index';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';

// 消息模块
export const appEvents = readonly(events);

type AppMittEvents = {
  [key: string]: any;
};

export type WatchAppEmitterType = EventEmitter<AppMittEvents>;

export function createEmitter() {
  return new EventEmitter<AppMittEvents>();
}

/**
 * 设置 eventBus 监听
 * @param event appEvents 中的事件
 * @param callback 回调
 */
export const useEventBusListener = (event: string, callback: (...arg: any[]) => unknown) => {
  const { getEmitter } = useMultiPolyvWatchApp();

  onMounted(() => {
    getEmitter().on(event, callback);
  });

  onBeforeUnmount(() => {
    getEmitter().off(event, callback);
  });
};

/**
 * 触发 eventBus 事件
 * @param event appEvents 中的事件
 */
export const useEventBusEmitter = (event: string) => {
  const { getEmitter } = useMultiPolyvWatchApp();

  function emitEvent(params?: any) {
    getEmitter().emit(event, params);
  }

  return {
    emitEvent,
  };
};
