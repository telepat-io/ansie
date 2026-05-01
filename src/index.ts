import { detectTerminalCapabilities } from './capabilities/detect.js';
import { loadImagePixels } from './image/load.js';
import { renderAnsiHalfBlocks } from './renderers/ansi.js';
import { renderAscii } from './renderers/ascii.js';
import { chooseRenderer } from './renderers/select.js';
import type {
  RenderBestForTerminalOptions,
  RenderImageInput,
  RenderImageOptions,
  RenderMode,
  RenderResult,
} from './types.js';

export type {
  ColorLevel,
  RenderBestForTerminalOptions,
  RenderImageInput,
  RenderImageOptions,
  RenderMode,
  RenderOptions,
  RenderPixelsInput,
  RenderResult,
  TerminalCapabilities,
} from './types.js';

export { detectTerminalCapabilities } from './capabilities/detect.js';
export { chooseRenderer } from './renderers/select.js';
export { renderAscii } from './renderers/ascii.js';
export { renderAnsiHalfBlocks } from './renderers/ansi.js';
export { rgbToAnsi16, rgbToAnsi256, rgbToSgr } from './renderers/palette.js';
export { resetAnsi, stripAnsi, styleText } from './styles/index.js';

function resolveMode(options: RenderImageOptions): RenderMode {
  if (options.mode) {
    return options.mode;
  }

  if (options.capabilities) {
    return chooseRenderer(options.capabilities);
  }

  return chooseRenderer(detectTerminalCapabilities());
}

export async function renderImage(input: RenderImageInput, options: RenderImageOptions = {}): Promise<RenderResult> {
  const capabilities = options.capabilities ?? detectTerminalCapabilities();
  const mode = resolveMode(options);
  const width = options.width ?? Math.min(80, capabilities.columns ?? 80);

  const pixels = await loadImagePixels(input, {
    width,
    height: options.height,
    mode,
  });

  const content = mode === 'ascii'
    ? renderAscii(pixels, {
      alphaThreshold: options.alphaThreshold,
      ramp: options.asciiRamp,
    })
    : renderAnsiHalfBlocks(pixels, {
      colorLevel: mode,
      alphaThreshold: options.alphaThreshold,
    });

  return {
    content,
    mode,
    width: pixels.width,
    height: pixels.height,
    capabilities,
  };
}

export async function renderBestForTerminal(
  input: RenderImageInput,
  options: RenderBestForTerminalOptions = {},
): Promise<RenderResult> {
  const capabilities = options.capabilities ?? detectTerminalCapabilities();
  const mode = chooseRenderer(capabilities);

  return renderImage(input, {
    ...options,
    mode,
    capabilities,
  });
}
