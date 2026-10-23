/**
 * 将十六进制的颜色转换成 r、g、b 格式数组
 * @param hex
 */
export function hexToRGB(hex: string): [number, number, number] {
  let r = 0;
  let g = 0;
  let b = 0;

  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    r = parseInt(result[1], 16);
    g = parseInt(result[2], 16);
    b = parseInt(result[3], 16);
  }

  return [r, g, b];
}
