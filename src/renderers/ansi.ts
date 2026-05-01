import type { ColorLevel, RenderPixelsInput } from '../types.js';
import { rgbToSgr, type RGB } from './palette.js';

const ESC = '\u001b[';
const RESET = `${ESC}0m`;

function rgbaAt(pixels: RenderPixelsInput, x: number, y: number): [number, number, number, number] {
  if (x < 0 || x >= pixels.width || y < 0 || y >= pixels.height) {
    return [0, 0, 0, 0];
  }

  const offset = (y * pixels.width + x) * 4;
  return [
    pixels.data[offset] ?? 0,
    pixels.data[offset + 1] ?? 0,
    pixels.data[offset + 2] ?? 0,
    pixels.data[offset + 3] ?? 0,
  ];
}

function opaque(rgba: [number, number, number, number], alphaThreshold: number): boolean {
  return (rgba[3] ?? 0) >= alphaThreshold;
}

function equalRgb(a: [number, number, number, number], b: [number, number, number, number]): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

function sgr(fg: string, bg: string): string {
  return `${ESC}${fg};${bg}m`;
}

function fgFor(rgba: [number, number, number, number], level: ColorLevel): string {
  return rgbToSgr([rgba[0], rgba[1], rgba[2]] as RGB, level, true);
}

function bgFor(rgba: [number, number, number, number], level: ColorLevel): string {
  return rgbToSgr([rgba[0], rgba[1], rgba[2]] as RGB, level, false);
}

export function renderAnsiHalfBlocks(
  pixels: RenderPixelsInput,
  options: { colorLevel: Exclude<ColorLevel, 'none'>; alphaThreshold?: number },
): string {
  const alphaThreshold = options.alphaThreshold ?? 13;
  const lines: string[] = [];

  for (let y = 0; y < pixels.height; y += 2) {
    let line = '';
    let activeSgr = '';

    for (let x = 0; x < pixels.width; x += 1) {
      const top = rgbaAt(pixels, x, y);
      const bottom = rgbaAt(pixels, x, y + 1);
      const topOpaque = opaque(top, alphaThreshold);
      const bottomOpaque = opaque(bottom, alphaThreshold);

      let nextSgr = '';
      let char = ' ';

      if (!topOpaque && !bottomOpaque) {
        nextSgr = RESET;
      } else if (topOpaque && bottomOpaque && equalRgb(top, bottom)) {
        nextSgr = sgr('39', bgFor(top, options.colorLevel));
      } else if (topOpaque && !bottomOpaque) {
        nextSgr = sgr(fgFor(top, options.colorLevel), '49');
        char = '▀';
      } else if (!topOpaque && bottomOpaque) {
        nextSgr = sgr(fgFor(bottom, options.colorLevel), '49');
        char = '▄';
      } else {
        nextSgr = sgr(fgFor(top, options.colorLevel), bgFor(bottom, options.colorLevel));
        char = '▀';
      }

      if (nextSgr !== activeSgr) {
        line += nextSgr;
        activeSgr = nextSgr;
      }

      line += char;
    }

    lines.push(`${line}${RESET}`);
  }

  return lines.join('\n');
}
