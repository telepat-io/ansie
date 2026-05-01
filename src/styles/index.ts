import type { TerminalCapabilities } from '../types.js';
import { rgbToSgr, type RGB } from '../renderers/palette.js';

const ESC = '\u001b[';
const RESET = `${ESC}0m`;

function rgbTuple(input: [number, number, number]): RGB {
  return [
    Math.max(0, Math.min(255, input[0])),
    Math.max(0, Math.min(255, input[1])),
    Math.max(0, Math.min(255, input[2])),
  ];
}

export function stripAnsi(text: string): string {
  let output = '';

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '\u001b' && text[i + 1] === '[') {
      i += 2;
      while (i < text.length && text[i] !== 'm') {
        i += 1;
      }
      continue;
    }

    output += ch;
  }

  return output;
}

export function styleText(
  text: string,
  options: {
    capabilities: TerminalCapabilities;
    fg?: [number, number, number];
    bg?: [number, number, number];
    bold?: boolean;
    underline?: boolean;
  },
): string {
  if (!options.capabilities.ansi) {
    return text;
  }

  const codes: string[] = [];

  if (options.bold) {
    codes.push('1');
  }

  if (options.underline) {
    codes.push('4');
  }

  if (options.fg) {
    codes.push(rgbToSgr(rgbTuple(options.fg), options.capabilities.colorLevel, true));
  }

  if (options.bg) {
    codes.push(rgbToSgr(rgbTuple(options.bg), options.capabilities.colorLevel, false));
  }

  if (codes.length === 0) {
    return text;
  }

  return `${ESC}${codes.join(';')}m${text}${RESET}`;
}

export function resetAnsi(): string {
  return RESET;
}
