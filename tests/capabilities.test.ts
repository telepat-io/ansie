import { describe, expect, it } from 'vitest';
import { detectTerminalCapabilities } from '../src/capabilities/detect.js';

describe('detectTerminalCapabilities', () => {
  it('detects truecolor terminals', () => {
    const result = detectTerminalCapabilities({
      env: {
        TERM: 'xterm-256color',
        COLORTERM: 'truecolor',
        LANG: 'en_US.UTF-8',
      },
      stream: { isTTY: true, columns: 120, rows: 40 } as NodeJS.WriteStream,
    });

    expect(result.colorLevel).toBe('truecolor');
    expect(result.ansi).toBe(true);
    expect(result.unicode).toBe(true);
  });

  it('detects ansi256 from TERM', () => {
    const result = detectTerminalCapabilities({
      env: {
        TERM: 'screen-256color',
        LANG: 'en_US.UTF-8',
      },
      stream: { isTTY: true } as NodeJS.WriteStream,
    });

    expect(result.colorLevel).toBe('ansi256');
  });

  it('falls back to ascii-compatible profile when no tty', () => {
    const result = detectTerminalCapabilities({
      env: {
        TERM: 'xterm',
        LANG: 'C',
      },
      stream: { isTTY: false } as NodeJS.WriteStream,
    });

    expect(result.colorLevel).toBe('none');
    expect(result.ansi).toBe(false);
  });

  it('honors NO_COLOR', () => {
    const result = detectTerminalCapabilities({
      env: {
        TERM: 'xterm-256color',
        NO_COLOR: '1',
        LANG: 'en_US.UTF-8',
      },
      stream: { isTTY: true } as NodeJS.WriteStream,
    });

    expect(result.colorLevel).toBe('none');
    expect(result.ansi).toBe(false);
  });

  it('supports FORCE_COLOR overrides', () => {
    const ansi16 = detectTerminalCapabilities({
      env: {
        TERM: 'dumb',
        FORCE_COLOR: '1',
        LANG: 'en_US.UTF-8',
      },
      stream: { isTTY: true } as NodeJS.WriteStream,
    });

    const ansi256 = detectTerminalCapabilities({
      env: {
        TERM: 'dumb',
        FORCE_COLOR: '2',
        LANG: 'en_US.UTF-8',
      },
      stream: { isTTY: true } as NodeJS.WriteStream,
    });

    const truecolor = detectTerminalCapabilities({
      env: {
        TERM: 'dumb',
        FORCE_COLOR: '3',
        LANG: 'en_US.UTF-8',
      },
      stream: { isTTY: true } as NodeJS.WriteStream,
    });

    const none = detectTerminalCapabilities({
      env: {
        TERM: 'xterm-256color',
        FORCE_COLOR: '0',
        LANG: 'en_US.UTF-8',
      },
      stream: { isTTY: true } as NodeJS.WriteStream,
    });

    expect(ansi16.colorLevel).toBe('ansi16');
    expect(ansi256.colorLevel).toBe('ansi256');
    expect(truecolor.colorLevel).toBe('truecolor');
    expect(none.colorLevel).toBe('none');
  });

  it('treats linux console as non-unicode by default', () => {
    const result = detectTerminalCapabilities({
      env: {
        TERM: 'linux',
        LANG: 'C',
      },
      stream: { isTTY: true } as NodeJS.WriteStream,
      platform: 'linux',
    });

    expect(result.unicode).toBe(false);
  });

  it('treats windows as unicode-capable', () => {
    const result = detectTerminalCapabilities({
      env: {
        TERM: 'dumb',
        LANG: 'C',
      },
      stream: { isTTY: true } as NodeJS.WriteStream,
      platform: 'win32',
    });

    expect(result.unicode).toBe(true);
  });
});
