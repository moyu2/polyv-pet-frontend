/**
 * @file 加载 vconsole
 */
import type { VConsole } from 'vconsole';
import { loadScript } from '@polyv/utils/load-script';

declare global {
  interface Window {
    VConsole?: {
      new (): VConsole;
    };
  }
}

let vConsole: VConsole | undefined;

// 模板页中，当存在 url 参数 console，会自动加载 vConsole 脚本，此时从全局获取 VConsole 类即可
export async function createVConsole() {
  if (vConsole) return vConsole;

  if (!window.VConsole) {
    await loadScript('https://s4.videocc.net/library/vconsole/3.x/vconsole-3.15.1.min.js', {
      props: {
        crossOrigin: 'anonymous',
      },
    });
    console.warn('createVConsole');
  }

  if (window.VConsole) {
    vConsole = new window.VConsole();
    return vConsole;
  }

  return undefined;
}

export async function loadVConsole() {
  if (vConsole) return;

  if (/[?&]console(=1)?(&|$)/.test(window.location.search)) {
    await createVConsole();
  }
}
