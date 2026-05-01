import { describe, expect, it } from 'vitest';
import { renderAnsiHalfBlocks } from '../src/renderers/ansi.js';

describe('renderAnsiHalfBlocks', () => {
  it('renders ansi with truecolor blocks', () => {
    const data = new Uint8ClampedArray([
      255, 0, 0, 255,
      0, 255, 0, 255,
      0, 0, 255, 255,
      255, 255, 255, 255,
    ]);

    const output = renderAnsiHalfBlocks(
      { width: 2, height: 2, data },
      { colorLevel: 'truecolor' },
    );

    expect(output).toContain('\u001b[');
    expect(output).toContain('▀');
  });

  it('uses background fill when top and bottom colors are equal', () => {
    const data = new Uint8ClampedArray([
      200, 100, 20, 255,
      200, 100, 20, 255,
    ]);

    const output = renderAnsiHalfBlocks(
      { width: 1, height: 2, data },
      { colorLevel: 'ansi16' },
    );

    expect(output).toContain('39;');
  });

  it('uses lower half block when top is transparent and bottom opaque', () => {
    const data = new Uint8ClampedArray([
      255, 0, 0, 0,
      0, 255, 0, 255,
    ]);

    const output = renderAnsiHalfBlocks(
      { width: 1, height: 2, data },
      { colorLevel: 'ansi256' },
    );

    expect(output).toContain('▄');
  });

  it('handles odd height by treating missing bottom pixels as transparent', () => {
    const data = new Uint8ClampedArray([
      10, 20, 30, 255,
    ]);

    const output = renderAnsiHalfBlocks(
      { width: 1, height: 1, data },
      { colorLevel: 'ansi256' },
    );

    expect(output).toContain('▀');
  });

  it('preserves transparency with blank output cells', () => {
    const data = new Uint8ClampedArray([
      255, 0, 0, 0,
      0, 255, 0, 0,
      0, 0, 255, 0,
      255, 255, 255, 0,
    ]);

    const output = renderAnsiHalfBlocks(
      { width: 2, height: 2, data },
      { colorLevel: 'ansi256' },
    );

    expect(output).toContain('  ');
  });
});
