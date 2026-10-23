export interface PetPoint {
  x: number;
  y: number;
}
export interface PetRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}
export interface PetViewport {
  width: number;
  height: number;
  petWidth: number;
  petHeight: number;
}

export function normalizePetScale(value: number): number {
  return Number.isFinite(value) ? Math.max(1, Math.min(value, 2.5)) : 1;
}

/** 保留用户选择的比例，实际尺寸按当前视口收缩，窗口恢复后可恢复原比例。 */
export function getPetSize(width: number, height: number, requestedScale: number) {
  const baseWidth = width < 600 ? 104 : 136;
  const baseHeight = (baseWidth * 224) / 256;
  const maxScale = Math.min(
    2.5,
    Math.max(1, width - 16) / baseWidth,
    Math.max(1, height - 16) / baseHeight,
  );
  const scale = Math.min(normalizePetScale(requestedScale), maxScale);
  return { petWidth: baseWidth * scale, petHeight: baseHeight * scale, scale, maxScale };
}

/** 与图集 baseline=212 对齐，缩放时固定脚底中心，再收回到最近的屏幕边缘。 */
export function resizePetPosition(
  point: PetPoint,
  previous: PetViewport,
  next: PetViewport,
): PetPoint {
  return clampPetPosition(
    {
      x: point.x + (previous.petWidth - next.petWidth) / 2,
      y: point.y + ((previous.petHeight - next.petHeight) * 212) / 224,
    },
    next,
  );
}

/** 优先上下展开；空间不足时尝试两侧，极小屏幕才在可视范围内覆盖显示。 */
export function placePetBubble(
  point: PetPoint,
  viewport: PetViewport,
  bubbleWidth: number,
  bubbleHeight: number,
): PetPoint {
  const maxX = Math.max(12, viewport.width - bubbleWidth - 12);
  const maxY = Math.max(12, viewport.height - bubbleHeight - 12);
  const clamp = (x: number, y: number) => ({
    x: Math.max(12, Math.min(x, maxX)),
    y: Math.max(12, Math.min(y, maxY)),
  });
  const centerX = point.x + viewport.petWidth / 2 - bubbleWidth / 2;
  const above = point.y - bubbleHeight - 8;
  const below = point.y + viewport.petHeight + 8;
  if (above >= 12) return clamp(centerX, above);
  if (below <= maxY) return clamp(centerX, below);
  const centerY = point.y + viewport.petHeight / 2 - bubbleHeight / 2;
  const right = point.x + viewport.petWidth + 8;
  if (right <= maxX) return clamp(right, centerY);
  const left = point.x - bubbleWidth - 8;
  if (left >= 12) return clamp(left, centerY);
  return clamp(centerX, point.y > viewport.height - below ? above : below);
}

/** 手动拖放只约束视口边缘，允许用户把宠物放到播放器或聊天区上方。 */
export function clampPetPosition(point: PetPoint, viewport: PetViewport): PetPoint {
  return {
    x: Math.max(8, Math.min(point.x, viewport.width - viewport.petWidth - 8)),
    y: Math.max(8, Math.min(point.y, viewport.height - viewport.petHeight - 8)),
  };
}

/** 禁入区增加少量留白，避免耳朵、尾巴恰好压到播放器边界。 */
export function isSafePoint(point: PetPoint, viewport: PetViewport, obstacles: PetRect[]): boolean {
  const { petWidth, petHeight, width, height } = viewport;
  if (
    point.x < 8 ||
    point.y < 8 ||
    point.x + petWidth > width - 8 ||
    point.y + petHeight > height - 8
  ) {
    return false;
  }
  return obstacles.every(
    rect =>
      point.x + petWidth <= rect.left - 6 ||
      point.x >= rect.right + 6 ||
      point.y + petHeight <= rect.top - 6 ||
      point.y >= rect.bottom + 6,
  );
}

/** 严格避开指定区域；无空白位置时交由停靠逻辑选择可见位置。 */
export function findSafeDock(
  viewport: PetViewport,
  obstacles: PetRect[],
  preferred?: PetPoint,
): PetPoint | null {
  if (preferred && isSafePoint(preferred, viewport, obstacles)) return preferred;
  for (let y = viewport.height - viewport.petHeight - 16; y >= 8; y -= 16) {
    for (let x = viewport.width - viewport.petWidth - 16; x >= 8; x -= 24) {
      if (isSafePoint({ x, y }, viewport, obstacles)) return { x, y };
    }
  }
  return null;
}

/** 空白不足时允许停在视频或聊天内容上方，优先避开输入区和弹窗，始终留在视口内。 */
export function findPetDock(
  viewport: PetViewport,
  obstacles: PetRect[],
  controls: PetRect[],
  preferred?: PetPoint,
): PetPoint {
  return (
    findSafeDock(viewport, obstacles, preferred) ||
    findSafeDock(viewport, controls, preferred) ||
    clampPetPosition(
      preferred || {
        x: viewport.width - viewport.petWidth - 24,
        y: viewport.height - viewport.petHeight - 24,
      },
      viewport,
    )
  );
}

/** 只沿同一条安全地面线行走，逐段检查路径，避免跨越禁入区域。 */
export function safeWalkTarget(
  start: PetPoint,
  distance: number,
  viewport: PetViewport,
  obstacles: PetRect[],
): number {
  const sign = Math.sign(distance);
  let x = start.x;
  for (let step = 8; step <= Math.abs(distance); step += 8) {
    const candidate = start.x + step * sign;
    if (!isSafePoint({ x: candidate, y: start.y }, viewport, obstacles)) break;
    x = candidate;
  }
  return x;
}

/** 000 朝上、顺时针 16 向；扇区边缘保留滞后，抑制鼠标轻颤导致来回切图。 */
export function lookDirection(dx: number, dy: number, previous: number | null): number | null {
  const distance = Math.hypot(dx, dy);
  if (distance < 28 || distance > 260) return null;
  const angle = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
  if (previous !== null) {
    const difference = Math.abs(((angle - previous * 22.5 + 540) % 360) - 180);
    if (difference < 14) return previous;
  }
  return Math.round(angle / 22.5) % 16;
}
