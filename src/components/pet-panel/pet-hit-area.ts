export interface PetHitArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const fullPetHitArea: PetHitArea = { x: 0, y: 0, width: 1, height: 1 };

/** 以透明像素收紧点击框，预留少量毛发和触摸余量；坐标归一化后随显示尺寸缩放。 */
export function alphaHitArea(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  padding = 6,
): PetHitArea {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (rgba[(y * width + x) * 4 + 3] < 12) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }
  if (right < left || bottom < top) return fullPetHitArea;
  left = Math.max(0, left - padding);
  top = Math.max(0, top - padding);
  right = Math.min(width, right + padding + 1);
  bottom = Math.min(height, bottom + padding + 1);
  return {
    x: left / width,
    y: top / height,
    width: (right - left) / width,
    height: (bottom - top) / height,
  };
}
