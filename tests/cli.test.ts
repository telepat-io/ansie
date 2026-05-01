import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import sharp from 'sharp';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { runCli } from '../src/cli/index.js';

const tempDirs: string[] = [];

async function createFixtureImage(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'ansie-cli-'));
  tempDirs.push(dir);
  const outputPath = join(dir, 'fixture.png');

  const data = Buffer.from([
    255, 0, 0, 255,
    0, 255, 0, 255,
    0, 0, 255, 255,
    255, 255, 255, 255,
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

describe('runCli', () => {
  it('prints capabilities for detect command', async () => {
    const writeSpy = vi.spyOn(process.stdout, 'write').mockReturnValue(true);

    const code = await runCli(['detect']);

    expect(code).toBe(0);
    expect(writeSpy).toHaveBeenCalled();
    writeSpy.mockRestore();
  });

  it('renders image and writes output file', async () => {
    const fixture = await createFixtureImage();
    const outputDir = await mkdtemp(join(tmpdir(), 'ansie-cli-out-'));
    tempDirs.push(outputDir);
    const targetFile = join(outputDir, 'rendered.txt');

    const code = await runCli(['render', fixture, '--mode', 'ascii', '--output', targetFile, '--width', '4']);

    expect(code).toBe(0);
  });

  it('prints styled text', async () => {
    const writeSpy = vi.spyOn(process.stdout, 'write').mockReturnValue(true);

    const code = await runCli(['style', 'hello', '--fg', '1,2,3', '--bold', '--underline']);

    expect(code).toBe(0);
    expect(writeSpy).toHaveBeenCalled();
    writeSpy.mockRestore();
  });

  it('returns non-zero on invalid style RGB input', async () => {
    const stderrSpy = vi.spyOn(process.stderr, 'write').mockReturnValue(true);

    const code = await runCli(['style', 'hello', '--fg', '1,2']);

    expect(code).toBe(1);
    expect(stderrSpy).toHaveBeenCalled();
    stderrSpy.mockRestore();
  });
});
