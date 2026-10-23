import { force, ForceResult } from 'force-autoplay';

const TEST_VIDEO = require('@/assets/media/mute-small-video.mp4');
// const TEST_VIDEO = 'https://s1.videocc.net/library/force-autoplay/media/video.mp4';

let forceResult: ForceResult | undefined;

export async function loadForceAutoplay() {
  try {
    forceResult = await force({
      clickBody: true,
      timeout: 1000,
      mediaSrc: TEST_VIDEO,
    });
  } catch (err) {
    console.error('loadForceAutoplay err', err);
  }

  return forceResult;
}

export function getForceAutoResult() {
  return forceResult;
}
