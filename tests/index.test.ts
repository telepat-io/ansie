import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import sharp from 'sharp';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderBestForTerminal, renderImage } from '../src/index.js';

const tempDirs: string[] = [];

async function createFixtureImage(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'ansie-test-'));
  tempDirs.push(dir);
  const outputPath = join(dir, 'fixture.png');

  const data = Buffer.from([
    255, 0, 0, 255,
    0, 255, 0, 255,
    0, 0, 255, 255,
    255, 255, 255, 0,
  ]);

  await sharp(data, {
    raw: {
      width: 2,
      height: 2,
      channels: 4,
    },
  }).png().toFile(outputPath);

  return outputPath;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('library entrypoints', () => {
  it('renderImage returns printable content and does not write to stdout', async () => {
    const fixture = await createFixtureImage();
    const writeSpy = vi.spyOn(process.stdout, 'write');

    const result = await renderImage(
      { path: fixture },
      {
        mode: 'ascii',
        width: 4,
      },
    );

    expect(result.content).toBeTypeOf('string');
    expect(result.content.length).toBeGreaterThan(0);
    expect(writeSpy).not.toHaveBeenCalled();

    writeSpy.mockRestore();
  });

  it('renderImage supports buffer input and explicit ansi mode', async () => {
    const fixture = await createFixtureImage();
    const buffer = await sharp(fixture).toBuffer();

    const result = await renderImage(
      { buffer },
      {
        mode: 'truecolor',
        width: 4,
      },
    );

    expect(result.mode).toBe('truecolor');
    expect(result.content).toContain('\u001b[');
  });

  it('renderBestForTerminal auto-selects renderer from capabilities', async () => {
    const fixture = await createFixtureImage();

    const result = await renderBestForTerminal(
      { path: fixture },
      {
        capabilities: {
          isTTY: true,
          ansi: true,
          unicode: true,
          colorLevel: 'ansi16',
        },
        width: 4,
      },
    );

    expect(result.mode).toBe('ansi16');
    expect(result.content).toContain('\u001b[');
  });

  it('renderBestForTerminal falls back to ascii for non-ansi terminals', async () => {
    const fixture = await createFixtureImage();

    const result = await renderBestForTerminal(
      { path: fixture },
      {
        capabilities: {
          isTTY: false,
          ansi: false,
          unicode: true,
          colorLevel: 'none',
        },
        width: 4,
      },
    );

    expect(result.mode).toBe('ascii');
  });

  it('auto-detects mode when no mode or capabilities are provided', async () => {
    const fixture = await createFixtureImage();

    const result = await renderImage({ path: fixture }, { width: 4 });

    expect(result.content.length).toBeGreaterThan(0);
  });

  it('throws when image input is missing', async () => {
    await expect(renderImage({} as never, { mode: 'ascii', width: 4 })).rejects.toThrow(
      'Either input.path or input.buffer must be provided.',
    );
  });
});
