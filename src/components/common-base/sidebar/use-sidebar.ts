import { type InjectionKey } from 'vue';

export type SidebarProvide = {
  getActive: () => number;
  setActive: (value: number) => void;
};

export const SIDEBAR_KEY: InjectionKey<SidebarProvide> = Symbol('MobileSidebar');
