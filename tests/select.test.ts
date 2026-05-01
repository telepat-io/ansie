import { describe, expect, it } from 'vitest';
import { chooseRenderer } from '../src/renderers/select.js';

describe('chooseRenderer', () => {
  it('chooses truecolor when available', () => {
    expect(chooseRenderer({ isTTY: true, ansi: true, unicode: true, colorLevel: 'truecolor' })).toBe('truecolor');
  });

  it('chooses ansi256 and ansi16 when available', () => {
    expect(chooseRenderer({ isTTY: true, ansi: true, unicode: true, colorLevel: 'ansi256' })).toBe('ansi256');
    expect(chooseRenderer({ isTTY: true, ansi: true, unicode: true, colorLevel: 'ansi16' })).toBe('ansi16');
  });

  it('falls back to ascii without ansi support', () => {
    expect(chooseRenderer({ isTTY: true, ansi: false, unicode: true, colorLevel: 'none' })).toBe('ascii');
  });

  it('falls back to ascii without unicode', () => {
    expect(chooseRenderer({ isTTY: true, ansi: true, unicode: false, colorLevel: 'ansi256' })).toBe('ascii');
  });

  it('supports force mode and preferAscii', () => {
    expect(
      chooseRenderer(
        { isTTY: true, ansi: true, unicode: true, colorLevel: 'truecolor' },
        { forceMode: 'ascii' },
      ),
    ).toBe('ascii');

    expect(
      chooseRenderer(
        { isTTY: true, ansi: true, unicode: true, colorLevel: 'truecolor' },
        { preferAscii: true },
      ),
    ).toBe('ascii');
  });
});
