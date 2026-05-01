import type { RenderPixelsInput } from '../types.js';

const DEFAULT_RAMP = ' .:-=+*#%@';

function luminance(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function renderAscii(
  pixels: RenderPixelsInput,
  options?: { alphaThreshold?: number; ramp?: string },
): string {
  const alphaThreshold = options?.alphaThreshold ?? 13;
  const ramp = options?.ramp && options.ramp.length > 1 ? options.ramp : DEFAULT_RAMP;
  const lines: string[] = [];

  for (let y = 0; y < pixels.height; y += 1) {
    let line = '';
    for (let x = 0; x < pixels.width; x += 1) {
      const offset = (y * pixels.width + x) * 4;
      const r = pixels.data[offset] ?? 0;
      const g = pixels.data[offset + 1] ?? 0;
      const b = pixels.data[offset + 2] ?? 0;
      const a = pixels.data[offset + 3] ?? 0;

      if (a < alphaThreshold) {
        line += ' ';
        continue;
      }

      const value = luminance(r, g, b) / 255;
      const idx = Math.round(value * (ramp.length - 1));
      line += ramp[idx] ?? ramp[ramp.length - 1] ?? '@';
    }
    lines.push(line.replace(/\s+$/g, ''));
  }

  return lines.join('\n');
}
