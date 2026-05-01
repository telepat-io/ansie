import { describe, expect, it } from 'vitest';
import { rgbToAnsi16, rgbToAnsi256, rgbToSgr } from '../src/renderers/palette.js';

describe('palette mapping', () => {
  it('maps rgb to ansi16 index', () => {
    const idx = rgbToAnsi16([250, 10, 10]);
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThan(16);
  });

  it('maps grayscale rgb to ansi256 grayscale band', () => {
    const code = rgbToAnsi256([120, 120, 120]);
    expect(code).toBeGreaterThanOrEqual(232);
    expect(code).toBeLessThanOrEqual(255);
  });

  it('builds sgr code based on color level', () => {
    expect(rgbToSgr([1, 2, 3], 'truecolor', true)).toContain('38;2;1;2;3');
    expect(rgbToSgr([1, 2, 3], 'ansi256', false)).toContain('48;5;');
    expect(rgbToSgr([255, 0, 0], 'ansi16', true)).toMatch(/^(3|9)\d$/);
  });
});
