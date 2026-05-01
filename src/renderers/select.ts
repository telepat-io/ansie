import type { RenderMode, TerminalCapabilities } from '../types.js';

export function chooseRenderer(
  capabilities: TerminalCapabilities,
  preferences?: { forceMode?: RenderMode; preferAscii?: boolean },
): RenderMode {
  if (preferences?.forceMode) {
    return preferences.forceMode;
  }

  if (preferences?.preferAscii) {
    return 'ascii';
  }

  if (!capabilities.ansi) {
    return 'ascii';
  }

  if (!capabilities.unicode) {
    return 'ascii';
  }

  switch (capabilities.colorLevel) {
    case 'truecolor':
      return 'truecolor';
    case 'ansi256':
      return 'ansi256';
    case 'ansi16':
      return 'ansi16';
    default:
      return 'ascii';
  }
}
