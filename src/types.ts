export type ColorLevel = 'none' | 'ansi16' | 'ansi256' | 'truecolor';

export interface TerminalCapabilities {
  isTTY: boolean;
  ansi: boolean;
  unicode: boolean;
  colorLevel: ColorLevel;
  columns?: number;
  rows?: number;
}

export type RenderMode = 'ascii' | 'ansi16' | 'ansi256' | 'truecolor';

export interface RenderPixelsInput {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export interface RenderOptions {
  mode: RenderMode;
  unicode?: boolean;
  alphaThreshold?: number;
  asciiRamp?: string;
}

export interface RenderResult {
  content: string;
  mode: RenderMode;
  width: number;
  height: number;
  capabilities?: TerminalCapabilities;
}

export interface RenderImageInput {
  path?: string;
  buffer?: Buffer;
}

export interface RenderImageOptions {
  width?: number;
  height?: number;
  mode?: RenderMode;
  alphaThreshold?: number;
  unicode?: boolean;
  asciiRamp?: string;
  capabilities?: TerminalCapabilities;
}

export interface RenderBestForTerminalOptions extends Omit<RenderImageOptions, 'mode'> {
  capabilities?: TerminalCapabilities;
}
