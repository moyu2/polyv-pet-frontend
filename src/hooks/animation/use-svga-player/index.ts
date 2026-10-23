import { $, DOMWrap } from '@polyv/utils/dom';
import { getFileSuffix } from '@/assets/utils/file';
import { onBeforeUnmount, onMounted, Ref, ref, unref, watch } from 'vue';
import {
  loadSvgaPlayer,
  SVGAParser,
  SVGAPlayer,
  SVGAVideoEntity,
} from '@/plugins/external-lib-loaders/load-svga-player';

// 记录加载的promise，避免重复加载
const loadSvgaPromises: UniversalParams<Promise<SVGAVideoEntity>> = {};

interface AnimationQueryItem<T extends object = object> {
  url: string;
  ext: T;
}

/**
 * @hook svga 动画播放器
 */
export const useSvgaPlayer = <T extends object = object>(
  wrapRef: Ref<HTMLDivElement | undefined>,
  options?: { beforePlaySvgaAnimation?: (svgaPlayer: SVGAPlayer, ext: T) => void },
) => {
  let svgaParser: SVGAParser | undefined;
  let svgaPlayer: SVGAPlayer | undefined;

  const { beforePlaySvgaAnimation = () => {} } = options || {};

  /**
   * 判断是否为 svga 文件地址
   * @param url 目标文件地址
   */
  function isSvgaFileUrl(url: string) {
    const suffix = getFileSuffix(url);
    return suffix === 'svga';
  }

  /** 是否正在播放动画 */
  const isPlayingAnimation = ref(false);

  /** 当前正在播放的动画item */
  const currentAnimationItem = ref<AnimationQueryItem | undefined>();

  /** 创建 svga 播放器 */
  async function createSvgaPlayer() {
    if (!wrapRef.value) {
      console.warn('createSvgaPlayer fail, wrapRef is undefined');
      return;
    }
    const SVGA = await loadSvgaPlayer();
    svgaParser = new SVGA.Parser();
    svgaPlayer = new SVGA.Player(wrapRef.value);
  }

  /** 清空 svga 动画 */
  function clearSvgaAnimation() {
    try {
      if (svgaPlayer) {
        svgaPlayer.clear();
        svgaPlayer.clearDynamicObjects();
        isPlayingAnimation.value = false;
      }
    } catch (e) {
      console.warn('clearSvgaAnimation 清除动画失败');
    }
  }

  /**
   * 加载 svga 动画文件地址
   * @param url svga 文件地址
   */
  function loadSvgaFile(url: string) {
    if (!loadSvgaPromises[url]) {
      loadSvgaPromises[url] = new Promise((resolve, reject) => {
        try {
          svgaParser?.load(url, videoItem => {
            resolve(videoItem);
          });
        } catch (e) {
          reject(e);
        }
      });
    }
    return loadSvgaPromises[url];
  }

  /**
   * 播放 svga 动画文件
   * @param url svga 文件地址
   */
  async function playSvgaAnimation({ url, ext }: AnimationQueryItem<T>) {
    clearSvgaAnimation();

    try {
      if (!svgaPlayer) {
        console.warn('playSvgaAnimation 播放失败，未创建播放器');
        return;
      }

      isPlayingAnimation.value = true;
      // 加载文件
      const videoItem = await loadSvgaFile(url);
      // 设置循环次数
      svgaPlayer.loops = 1;
      // 设置播放器文件
      svgaPlayer.setVideoItem(videoItem);
      // 在播放 svg 动画前加载拦截器
      beforePlaySvgaAnimation(svgaPlayer, ext);
      // 开始播放动画
      svgaPlayer.startAnimation();
      // 侦听播放结束，播放下一个动画
      svgaPlayer.onFinished(() => {
        isPlayingAnimation.value = false;
        checkAnimationQueue();
      });
    } catch (e) {
      console.warn('playSvgaAnimation 播放失败');
      isPlayingAnimation.value = false;
      checkAnimationQueue();
    }
  }

  onMounted(() => {
    createSvgaPlayer();
  });

  onBeforeUnmount(() => {
    clearSvgaAnimation();
  });

  /** 当前显示的图片 */
  const currentImage = ref<string>();
  /** 隐藏图片定时器 */
  let hideImageTimer: number | undefined;
  /** 图片节点 */
  let $imageElem: DOMWrap | undefined;

  watch(
    () => unref(currentImage),
    () => {
      const imageUrl = unref(currentImage);
      const wrapElem = unref(wrapRef);
      if (!wrapElem) return;

      // 没有动画图片，移除节点
      if (!imageUrl) {
        $imageElem?.remove();
        $imageElem = undefined;
        return;
      }

      if (!$imageElem) {
        const divElem = document.createElement('div');
        $imageElem = $(divElem);
      }

      $imageElem.css({
        width: '61.2%',
        height: '80%',
        'background-size': '100% 100%',
        'background-repeat': 'no-repeat',
        'background-image': `url(${imageUrl})`,
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      });

      $(wrapElem).append($imageElem);
    },
  );

  watch(
    () => unref(isPlayingAnimation),
    () => {
      if (!isPlayingAnimation.value) {
        currentAnimationItem.value = undefined;
      }
    },
  );

  /**
   * 播放图片动画
   * @param url 图片地址
   * @param time 显示时间，默认 2 秒
   */
  function playImageAnimation({ url }: AnimationQueryItem<T>, time = 2000) {
    clearImageAnimation();
    currentImage.value = url;
    isPlayingAnimation.value = true;
    hideImageTimer = window.setTimeout(() => {
      clearImageAnimation();
      checkAnimationQueue();
    }, time);
  }

  /**
   * 清空图片动画
   */
  function clearImageAnimation() {
    isPlayingAnimation.value = false;
    currentImage.value = undefined;
    if (hideImageTimer) {
      clearTimeout(hideImageTimer);
      hideImageTimer = undefined;
    }
  }

  onBeforeUnmount(() => {
    clearImageAnimation();
  });

  /** 当前动画是否暂停 */
  const isPaused = ref(false);

  /** 暂停当前的动画队列 */
  function pauseAnimationQueue() {
    isPaused.value = true;
  }

  /** 开始当前的动画队列 */
  function startAnimationQueue() {
    isPaused.value = false;
    checkAnimationQueue();
  }

  /** svga 动画文件队列 */
  const animationQueue = ref<AnimationQueryItem<Ref<T>>[]>([]);

  /**
   * 插入 svga 文件或图片到动画队列中
   * @param url 地址
   * @param inHeader 是否从头部插入
   * @param filterRepeat 是否过滤重复的svg动画
   */
  function pushAnimationQueue(url: string, inHeader = false, extParam?: T, filterRepeat = false) {
    if (!url) return;

    if (filterRepeat) {
      const existsInQueue = animationQueue.value.some(item => item.url === url);

      if (existsInQueue || currentAnimationItem.value?.url === url) {
        return;
      }
    }

    const ext = extParam || ({} as T);
    if (inHeader) {
      animationQueue.value.unshift({ url, ext });
    } else {
      animationQueue.value.push({ url, ext });
    }
    checkAnimationQueue();
  }

  /** 检查动画队列 */
  function checkAnimationQueue() {
    // 队列为空、正在播放动画、当前暂停播放
    if (animationQueue.value.length === 0 || isPlayingAnimation.value || isPaused.value) {
      return;
    }

    const item = animationQueue.value.shift();
    if (!item || !item.url) return;

    currentAnimationItem.value = item;

    if (isSvgaFileUrl(item.url)) {
      playSvgaAnimation(item);
    } else {
      playImageAnimation(item);
    }
  }

  return {
    animationQueue,
    loadSvgaFile,
    clearSvgaAnimation,
    pushAnimationQueue,
    pauseAnimationQueue,
    startAnimationQueue,
  };
};
