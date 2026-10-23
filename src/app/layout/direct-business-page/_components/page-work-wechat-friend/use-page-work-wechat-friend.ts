import { wait } from '@/assets/utils/utils';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { computed, onMounted, ref } from 'vue';
import { DirectBusinessPageType } from '../../type';

interface CanvasUtilCommonStyle {
  fontFamily?: string;
  fontSize?: number;
  fontBold?: string;
  fillStyle?: CanvasFillStrokeStyles['fillStyle'];
  textAlign?: CanvasTextAlign;
}

const useCanvasUtils = (options?: { zoomRatio?: number }) => {
  const { zoomRatio = 1 } = options || {};

  /** 默认字体族 */
  const DEFAULT_FONT_FAMILY =
    '"Helvetica Neue", Helvetica, "PingFang SC", "Microsoft YaHei", Arial, sans-serif';

  function __setCtxStyle(ctx: CanvasRenderingContext2D, style?: CanvasUtilCommonStyle) {
    if (!style) return;

    function __setCtxFont(style: CanvasUtilCommonStyle) {
      const spaceChar = ' ';

      const fontBold = style.fontBold || '';

      let fontSize = '';
      if (style.fontSize) {
        fontSize = spaceChar + `${style.fontSize * zoomRatio}px`;
      }

      const fontFamily = spaceChar + (style.fontFamily || DEFAULT_FONT_FAMILY);

      const font = `${fontBold}${fontSize}${fontFamily}`;

      if (font.trim().length > 0) {
        ctx.font = font;
      }
    }

    __setCtxFont(style);
    if (style.fillStyle) ctx.fillStyle = style.fillStyle;
    if (style.textAlign) ctx.textAlign = style.textAlign;
  }

  function __computeImageSize(size: { width: number; height: number }, ignoreRatio: boolean) {
    let ratio = zoomRatio;
    if (ignoreRatio) {
      ratio = 1;
    }

    return {
      width: size.width * ratio,
      height: size.height * ratio,
    };
  }

  function __computePosition(position?: { x: number; y: number }) {
    const { x, y } = position || { x: 0, y: 0 };
    return {
      x: x * zoomRatio,
      y: y * zoomRatio,
    };
  }

  /** 绘制图片 */
  async function drawCanvasImage(
    ctx: CanvasRenderingContext2D,
    imgSrc: string,
    options: {
      size?: { width: number; height: number };
      position?: { x: number; y: number };
      ignoreRatio?: boolean;
    } = {},
  ) {
    const { ignoreRatio = false } = options;
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imgSrc;
      img.setAttribute('crossOrigin', 'Anonymous'); // 不兼容 IE，如果需要换成 xhr 来兼容
      img.onload = () => {
        const { width, height } = __computeImageSize(options.size || img, ignoreRatio);
        const { x, y } = __computePosition(options.position);
        ctx.drawImage(img, x, y, width, height);
        resolve('drawImage success');
      };
      img.onerror = () => {
        reject(new Error('drawImage Error'));
      };
    });
  }

  /** 绘制文字 */
  async function drawCanvasText(
    ctx: CanvasRenderingContext2D,
    text: string,
    options: {
      style?: CanvasUtilCommonStyle;
      position?: { x: number; y: number };
      isMeasure?: boolean;
    } = {},
  ) {
    const { isMeasure = false } = options;
    const { x, y } = __computePosition(options.position);

    __setCtxStyle(ctx, options.style);

    if (!isMeasure) {
      ctx.fillText(text, x, y);
      return;
    }

    const textWidth = ctx.measureText(text).width;
    const spacing = 10;
    const charSpacing = (spacing * 2 + textWidth) / (text.length - 1);
    for (let i = 0; i < text.length; i++) {
      const char = text.charAt(i);
      const xx = spacing + i * (charSpacing + ctx.measureText(char).width / 3);
      ctx.fillText(char, xx + x, y);
    }
  }

  return {
    drawCanvasImage,
    drawCanvasText,
  };
};

export const usePageWorkWechatFriend = () => {
  /** work-wechat-bg.png 原图宽度 */
  const DEFAULT_DESIGN_WIDTH = 1125;

  /** 适配倍率(原图 / 设计稿) */
  const DEFAULT_ZOOM_RATIO = 1125 / 375;

  const { drawCanvasImage, drawCanvasText } = useCanvasUtils({
    zoomRatio: DEFAULT_ZOOM_RATIO,
  });

  const { directBusinessPageData } = storeDefinitionToRefs(useWatchAppStore);

  const pageData = computed(() => {
    if (
      !directBusinessPageData.value ||
      directBusinessPageData.value.pageType !== DirectBusinessPageType.WorkWechatFriend
    ) {
      return null;
    }

    return directBusinessPageData.value.data;
  });

  const canvasImage = ref<string>();

  function generateCanvasStyle() {
    const ratio = 667 / 375;

    const width = DEFAULT_DESIGN_WIDTH;
    const height = width * ratio;

    return {
      width,
      height,
    };
  }

  async function loadFont() {
    try {
      if (!window.FontFace) throw new Error('not support');

      // 加载必要字体
      const fontUrl = require('./fonts/YouSheBiaoTiHei-2.ttf');
      const font = new window.FontFace('YouSheBiaoTi Hei', `url(${fontUrl})`);
      const item = await font.load();
      document.fonts.add(item);
    } catch (error) {
      await wait(500); // 加载失败时默认使用 500 毫秒延迟处理
    }
  }

  async function drawCanvas(ctx: CanvasRenderingContext2D) {
    await loadFont();

    // 绘制背景图
    const bgSrc = require('./images/work-wechat-bg.png');
    await drawCanvasImage(ctx, bgSrc, { ignoreRatio: true });

    if (!pageData.value) throw new Error('please prefer to get pageData');

    // 绘制 title
    drawCanvasText(ctx, pageData.value.title || '扫一扫添加企微好友', {
      style: {
        fontSize: 24,
        fontFamily: '"YouSheBiaoTi Hei"',
        fillStyle: '#0D6EFD',
        textAlign: 'center',
      },
      position: {
        x: 375 / 2,
        y: 80,
      },
    });

    // 绘制 Desc
    drawCanvasText(ctx, pageData.value.desc || '成功添加即可进入直播间', {
      style: {
        fontSize: 16,
        fontBold: 'bold',
        fillStyle: '#1233A7',
        textAlign: 'center',
      },
      position: {
        x: 375 / 2,
        y: 125,
      },
    });

    // 绘制二维码
    if (pageData.value.href) {
      await drawCanvasImage(ctx, pageData.value.href, {
        size: {
          width: 176,
          height: 176,
        },
        position: {
          x: 102,
          y: 228,
        },
      });
    }

    // 绘制"长按识别二维码加好友"
    drawCanvasText(ctx, '长按识别二维码加好友', {
      style: {
        fontSize: 12,
        fontFamily: '"YouSheBiaoTi Hei"',
        fillStyle: '#1233A7',
        textAlign: 'center',
      },
      position: {
        x: 109,
        y: 427,
      },
      isMeasure: true,
    });

    return ctx.canvas.toDataURL('image/jpeg');
  }

  async function initCanvas() {
    const dpr = Math.min(2, window.devicePixelRatio);

    const $canvas = document.createElement('canvas');
    const { width, height } = generateCanvasStyle();

    $canvas.style.width = `${width}px`;
    $canvas.style.height = `${height}px`;

    $canvas.width = width * dpr;
    $canvas.height = height * dpr;

    const ctx = $canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      canvasImage.value = await drawCanvas(ctx);
    }
  }

  onMounted(() => {
    initCanvas();
  });

  return {
    canvasImage,
  };
};
