/**
 * @file 颜色校验逻辑 Composable
 */

/**
 * 颜色校验 Composable
 */
export function useColorValidation() {
  /**
   * 校验颜色格式
   * 支持 #RGB 和 #RRGGBB 格式
   */
  function validateColor(color: string): boolean {
    return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
  }

  /**
   * 校验透明度值
   * 必须在 0-1 范围内
   */
  function validateOpacity(value: number): boolean {
    return !isNaN(value) && value >= 0 && value <= 1;
  }

  /**
   * 规范化颜色值
   * 将 #RGB 转换为 #RRGGBB
   */
  function normalizeColor(color: string): string {
    if (!validateColor(color)) {
      return color;
    }

    // 如果是 #RGB 格式，转换为 #RRGGBB
    if (color.length === 4) {
      const r = color[1];
      const g = color[2];
      const b = color[3];
      return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
    }

    return color.toUpperCase();
  }

  /**
   * 规范化透明度值
   * 确保在 0-1 范围内
   */
  function normalizeOpacity(value: number): number {
    return Math.max(0, Math.min(1, value));
  }

  /**
   * 校验并提示错误
   * 返回校验结果，并弹出 alert 提示
   */
  function validateColorWithAlert(color: string): boolean {
    if (!color) {
      return false;
    }

    if (!validateColor(color)) {
      alert('请输入有效的颜色值，例如 #FF0000 或 #F00');
      return false;
    }

    return true;
  }

  /**
   * 校验透明度并限制范围
   */
  function validateOpacityWithBounds(value: number | string | null): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) {
      return 0;
    }

    return normalizeOpacity(numValue);
  }

  return {
    validateColor,
    validateOpacity,
    normalizeColor,
    normalizeOpacity,
    validateColorWithAlert,
    validateOpacityWithBounds,
  };
}
