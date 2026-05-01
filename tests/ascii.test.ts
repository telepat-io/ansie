import { describe, expect, it } from 'vitest';
import { renderAscii } from '../src/renderers/ascii.js';

describe('renderAscii', () => {
  it('renders opaque pixels with density ramp', () => {
    const data = new Uint8ClampedArray([
      0, 0, 0, 255,
      255, 255, 255, 255,
    ]);

    const output = renderAscii({ width: 2, height: 1, data });
    expect(output.length).toBeGreaterThan(0);
    expect(output).toContain('@');
  });

  it('uses fallback ramp when ramp option is too short', () => {
    const data = new Uint8ClampedArray([
      120, 120, 120, 255,
    ]);

    const output = renderAscii({ width: 1, height: 1, data }, { ramp: 'x' });
    expect(output.length).toBe(1);
  });

  it('renders transparent pixels as spaces', () => {
    const data = new Uint8ClampedArray([
      255, 0, 0, 0,
      0, 255, 0, 0,
    ]);

    const output = renderAscii({ width: 2, height: 1, data });
    expect(output).toBe('');
  });
});
