import type { ColorLevel } from '../types.js';

export type RGB = [number, number, number];

const ANSI16_COLORS: RGB[] = [
  [0, 0, 0],
  [128, 0, 0],
  [0, 128, 0],
  [128, 128, 0],
  [0, 0, 128],
  [128, 0, 128],
  [0, 128, 128],
  [192, 192, 192],
  [128, 128, 128],
  [255, 0, 0],
  [0, 255, 0],
  [255, 255, 0],
  [0, 0, 255],
  [255, 0, 255],
  [0, 255, 255],
  [255, 255, 255],
];

function colorDistance(a: RGB, b: RGB): number {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
}

function closestIndex(source: RGB, palette: RGB[]): number {
  let bestDistance = Number.POSITIVE_INFINITY;
  let bestIndex = 0;

  for (let i = 0; i < palette.length; i += 1) {
    const candidate = palette[i] as RGB;
    const distance = colorDistance(source, candidate);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
    }
  }

  return bestIndex;
}

export function rgbToAnsi16(rgb: RGB): number {
  return closestIndex(rgb, ANSI16_COLORS);
}

export function rgbToAnsi256(rgb: RGB): number {
  const [r, g, b] = rgb;

  if (r === g && g === b) {
    if (r < 8) {
      return 16;
    }
    if (r > 248) {
      return 231;
    }
    return Math.round(((r - 8) / 247) * 24) + 232;
  }

  const rq = Math.round((r / 255) * 5);
  const gq = Math.round((g / 255) * 5);
  const bq = Math.round((b / 255) * 5);

  return 16 + (36 * rq) + (6 * gq) + bq;
}

function ansi16Sgr(index: number, foreground: boolean): string {
  if (index < 8) {
    return String((foreground ? 30 : 40) + index);
  }

  return String((foreground ? 90 : 100) + (index - 8));
}

export function rgbToSgr(rgb: RGB, level: ColorLevel, foreground: boolean): string {
  if (level === 'truecolor') {
    return `${foreground ? 38 : 48};2;${rgb[0]};${rgb[1]};${rgb[2]}`;
  }

  if (level === 'ansi256') {
    return `${foreground ? 38 : 48};5;${rgbToAnsi256(rgb)}`;
  }

  if (level === 'ansi16') {
    return ansi16Sgr(rgbToAnsi16(rgb), foreground);
  }

  return foreground ? '39' : '49';
}
