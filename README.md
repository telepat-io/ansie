# Ansie

Terminal image rendering and ANSI utility toolkit for Node.js.

`ansie` auto-detects terminal capabilities and chooses the best output for the current environment:
- Truecolor ANSI with Unicode half-blocks when available
- ANSI-256 fallback
- ANSI-16 fallback
- Plain ASCII fallback where color or Unicode is unavailable

This package is both:
- An npm library (`@telepat/ansie`)
- A CLI tool (`ansie`)

## Language
- English: [README.md](./README.md)
- Simplified Chinese: [README.zh-CN.md](./README.zh-CN.md)

## Install

```bash
npm i @telepat/ansie
```

CLI global install:

```bash
npm i -g @telepat/ansie
```

## Library Usage

```ts
import { renderImage, renderBestForTerminal, detectTerminalCapabilities } from '@telepat/ansie';

const capabilities = detectTerminalCapabilities();

const rendered = await renderBestForTerminal(
  { path: './avatar.webp' },
  { width: 60, capabilities },
);

// Caller controls where to display
console.log(rendered.content);
```

Force a specific mode:

```ts
const rendered = await renderImage(
  { path: './avatar.webp' },
  { mode: 'ascii', width: 80 },
);
console.log(rendered.content);
```

## API

### `detectTerminalCapabilities()`
Returns a capability profile with color level, Unicode support, and TTY details.

### `chooseRenderer(capabilities, preferences?)`
Returns one of `truecolor`, `ansi256`, `ansi16`, `ascii`.

### `renderImage(input, options?)`
Renders an image with a requested mode (or auto mode if omitted) and returns:
- `content`: printable string
- `mode`: effective mode
- dimensions and detected capabilities metadata

Important: library APIs do not write to stdout. They return strings so callers can display with `console.log`, write files, or pipe elsewhere.

### `renderBestForTerminal(input, options?)`
Uses detected capabilities (or provided capabilities) to pick the best mode automatically.

### ANSI utility helpers
- `styleText(text, options)` capability-aware style/color composition
- `stripAnsi(text)` remove ANSI escapes
- `resetAnsi()` reset code

## CLI Usage

### Auto render

```bash
ansie render ./avatar.webp --width 60
```

### Force mode

```bash
ansie render ./avatar.webp --mode ascii --width 80
ansie render ./avatar.webp --mode ansi256 --width 80
```

### Save to file

```bash
ansie render ./avatar.webp --mode ascii --output ./avatar.txt
```

### Detect current terminal profile

```bash
ansie detect
```

### Style utility

```bash
ansie style "Hello" --fg 255,120,10 --bold --underline
```

## Transparency Rules

- Pixels below alpha threshold are treated as transparent.
- In ANSI modes, transparent regions use terminal default background behavior.
- In ASCII mode, transparent regions become spaces.

## Development

```bash
npm ci
npm run lint
npm run typecheck
npm run test:coverage
npm run build
```

Coverage policy:
- Unit tests must maintain at least 90% for lines, functions, branches, and statements.

## Release

Release flow uses release-please:
- `release-please-config.json`
- `.release-please-manifest.json`
- `.github/workflows/release-please.yml`

On merge to `main`, release-please manages versioning/changelog and publishes to npm through trusted publishing.

## License

MIT
