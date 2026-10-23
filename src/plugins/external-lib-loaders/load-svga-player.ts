import { loadScript } from '@polyv/utils/load-script';
import type {
  Player as SVGAPlayer,
  Parser as SVGAParser,
  VideoEntity as SVGAVideoEntity,
} from 'svgaplayerweb';

/** svga 加载地址 */
const SVGA_PLAYER_URL = 'https://s4.videocc.net/library/svgaplayerweb/2.x/svga-2.3.1.min.js';

export { SVGAPlayer, SVGAParser, SVGAVideoEntity };

export interface SVGASdk {
  Player: typeof SVGAPlayer;
  Parser: typeof SVGAParser;
}

// declare global {
//   interface Window {
//     SVGA?: SVGASdk;
//   }
// }

let svgaPlayerLoader: Promise<SVGASdk> | undefined;

/**
 * 加载 svga 播放器
 */
export function loadSvgaPlayer(): Promise<SVGASdk> {
  if (window.SVGA) {
    return Promise.resolve(window.SVGA);
  }

  if (!svgaPlayerLoader) {
    svgaPlayerLoader = new Promise((resolve, reject) => {
      (async () => {
        await loadScript(SVGA_PLAYER_URL);
        if (window.SVGA) {
          resolve(window.SVGA);
        } else {
          reject(new Error('loadSvgaPlayer fail, window.SVGA is undefined'));
        }
      })();
    });
  }

  return svgaPlayerLoader;
}
