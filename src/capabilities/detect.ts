import type { ColorLevel, TerminalCapabilities } from '../types.js';

const TRUECOLOR_HINTS = ['truecolor', '24bit'];
const ANSI256_HINTS = ['256color'];

function detectColorLevelFromEnv(env: NodeJS.ProcessEnv): ColorLevel {
  const noColor = env.NO_COLOR !== undefined;
  if (noColor) {
    return 'none';
  }

  const forceColor = env.FORCE_COLOR;
  if (forceColor === '0') {
    return 'none';
  }

  const colorTerm = (env.COLORTERM ?? '').toLowerCase();
  if (TRUECOLOR_HINTS.some((hint) => colorTerm.includes(hint))) {
    return 'truecolor';
  }

  const term = (env.TERM ?? '').toLowerCase();
  if (TRUECOLOR_HINTS.some((hint) => term.includes(hint))) {
    return 'truecolor';
  }

  if (ANSI256_HINTS.some((hint) => term.includes(hint))) {
    return 'ansi256';
  }

  if (forceColor === '3') {
    return 'truecolor';
  }

  if (forceColor === '2') {
    return 'ansi256';
  }

  if (forceColor === '1') {
    return 'ansi16';
  }

  if (term && term !== 'dumb') {
    return 'ansi16';
  }

  return 'none';
}

function detectUnicode(env: NodeJS.ProcessEnv, platform: NodeJS.Platform): boolean {
  const term = (env.TERM ?? '').toLowerCase();
  const lang = (env.LC_ALL ?? env.LC_CTYPE ?? env.LANG ?? '').toLowerCase();

  if (platform === 'win32') {
    return true;
  }

  if (term === 'linux') {
    return false;
  }

  return lang.includes('utf-8') || lang.includes('utf8') || term.includes('xterm') || term.includes('screen');
}

export function detectTerminalCapabilities(params?: {
  env?: NodeJS.ProcessEnv;
  stream?: NodeJS.WriteStream;
  platform?: NodeJS.Platform;
}): TerminalCapabilities {
  const env = params?.env ?? process.env;
  const stream = params?.stream ?? process.stdout;
  const platform = params?.platform ?? process.platform;

  const isTTY = Boolean(stream.isTTY);
  const colorLevel = isTTY ? detectColorLevelFromEnv(env) : 'none';

  return {
    isTTY,
    ansi: isTTY && colorLevel !== 'none',
    unicode: detectUnicode(env, platform),
    colorLevel,
    columns: stream.columns,
    rows: stream.rows,
  };
}
