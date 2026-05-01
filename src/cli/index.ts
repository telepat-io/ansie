#!/usr/bin/env node

import { Command } from 'commander';
import { writeFile } from 'node:fs/promises';
import {
  detectTerminalCapabilities,
  renderBestForTerminal,
  renderImage,
  styleText,
  type RenderMode,
} from '../index.js';

function parseRgb(input: string | undefined): [number, number, number] | undefined {
  if (!input) {
    return undefined;
  }

  const parts = input.split(',').map((segment) => Number(segment.trim()));
  if (parts.length !== 3 || parts.some((value) => Number.isNaN(value))) {
    throw new Error('RGB values must be provided as r,g,b (for example: 255,120,10).');
  }

  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

export async function runCli(argv: string[]): Promise<number> {
  const program = new Command();
  program.name('ansie').description('Render images for terminals with automatic ANSI/ASCII fallback.');

  program
    .command('render')
    .description('Render an image to terminal text output.')
    .argument('<input>', 'Image path')
    .option('-w, --width <number>', 'Output width in characters', (v) => Number(v))
    .option('--height <number>', 'Output height in terminal rows', (v) => Number(v))
    .option('-m, --mode <mode>', 'Render mode: auto|ascii|ansi16|ansi256|truecolor', 'auto')
    .option('-o, --output <path>', 'Write output to file instead of stdout')
    .action(async (input: string, options: { width?: number; height?: number; mode: string; output?: string }) => {
      const mode = options.mode as 'auto' | RenderMode;
      const result = mode === 'auto'
        ? await renderBestForTerminal({ path: input }, {
          width: options.width,
          height: options.height,
        })
        : await renderImage({ path: input }, {
          width: options.width,
          height: options.height,
          mode,
        });

      if (options.output) {
        await writeFile(options.output, result.content, 'utf8');
        return;
      }

      process.stdout.write(`${result.content}\n`);
    });

  program
    .command('detect')
    .description('Print detected terminal capabilities as JSON.')
    .action(() => {
      const capabilities = detectTerminalCapabilities();
      process.stdout.write(`${JSON.stringify(capabilities, null, 2)}\n`);
    });

  program
    .command('style')
    .description('Apply ANSI style to text with capability-aware downgrade.')
    .argument('<text>', 'Text to style')
    .option('--fg <rgb>', 'Foreground color in r,g,b format')
    .option('--bg <rgb>', 'Background color in r,g,b format')
    .option('--bold', 'Apply bold')
    .option('--underline', 'Apply underline')
    .action((text: string, options: { fg?: string; bg?: string; bold?: boolean; underline?: boolean }) => {
      const capabilities = detectTerminalCapabilities();
      const output = styleText(text, {
        capabilities,
        fg: parseRgb(options.fg),
        bg: parseRgb(options.bg),
        bold: Boolean(options.bold),
        underline: Boolean(options.underline),
      });

      process.stdout.write(`${output}\n`);
    });

  try {
    await program.parseAsync(argv, { from: 'user' });
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown CLI failure';
    process.stderr.write(`ansie: ${message}\n`);
    return 1;
  }
}
