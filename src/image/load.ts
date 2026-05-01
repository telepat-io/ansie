import sharp from 'sharp';
import type { RenderImageInput, RenderMode, RenderPixelsInput } from '../types.js';

function computeRows(width: number, sourceWidth: number, sourceHeight: number): number {
  const estimated = Math.round((sourceHeight / sourceWidth) * width * 0.5);
  return Math.max(1, estimated);
}

export async function loadImagePixels(
  input: RenderImageInput,
  options: { width: number; height?: number; mode: RenderMode },
): Promise<RenderPixelsInput> {
  const source = input.path ? sharp(input.path) : input.buffer ? sharp(input.buffer) : null;
  if (!source) {
    throw new Error('Either input.path or input.buffer must be provided.');
  }

  const metadata = await source.metadata();
  const sourceWidth = metadata.width;
  const sourceHeight = metadata.height;

  if (!sourceWidth || !sourceHeight) {
    throw new Error('Unable to determine image dimensions.');
  }

  const outputWidth = Math.max(1, options.width);
  const outputRows = options.height ?? computeRows(outputWidth, sourceWidth, sourceHeight);
  const pixelHeight = options.mode === 'ascii' ? outputRows : outputRows * 2;

  const { data, info } = await source
    .ensureAlpha()
    .resize({
      width: outputWidth,
      height: pixelHeight,
      fit: 'inside',
    })
    .raw()
    .toBuffer({ resolveWithObject: true });

  return {
    width: info.width,
    height: info.height,
    data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength),
  };
}
