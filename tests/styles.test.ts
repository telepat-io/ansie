import { describe, expect, it } from 'vitest';
import { resetAnsi, stripAnsi, styleText } from '../src/styles/index.js';

describe('styleText', () => {
  it('returns plain text when ansi unavailable', () => {
    const output = styleText('hello', {
      capabilities: { isTTY: false, ansi: false, unicode: true, colorLevel: 'none' },
      bold: true,
    });

    expect(output).toBe('hello');
  });

  it('returns plain text if no style options are provided', () => {
    const output = styleText('hello', {
      capabilities: { isTTY: true, ansi: true, unicode: true, colorLevel: 'ansi16' },
    });

    expect(output).toBe('hello');
  });

  it('applies sgr escapes when ansi is available', () => {
    const output = styleText('hello', {
      capabilities: { isTTY: true, ansi: true, unicode: true, colorLevel: 'truecolor' },
      fg: [12, 34, 56],
      bg: [10, 10, 10],
      bold: true,
      underline: true,
    });

    expect(output).toContain('\u001b[');
    expect(stripAnsi(output)).toBe('hello');
    expect(resetAnsi()).toBe('\u001b[0m');
  });
});
