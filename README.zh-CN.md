# Ansie

面向 Node.js 的终端图像渲染与 ANSI 工具库。

`ansie` 会自动检测终端能力，并输出当前环境下最合适的结果：
- 支持时使用 Truecolor ANSI + Unicode 半块字符
- 退化到 ANSI-256
- 再退化到 ANSI-16
- 在无颜色或无 Unicode 场景下退化到纯 ASCII

该项目同时提供：
- npm 库（`@telepat/ansie`）
- CLI 工具（`ansie`）

## 语言
- English: [README.md](./README.md)
- 简体中文: [README.zh-CN.md](./README.zh-CN.md)

## 安装

```bash
npm i @telepat/ansie
```

全局安装 CLI：

```bash
npm i -g @telepat/ansie
```

## 作为库使用

```ts
import { renderImage, renderBestForTerminal, detectTerminalCapabilities } from '@telepat/ansie';

const capabilities = detectTerminalCapabilities();

const rendered = await renderBestForTerminal(
  { path: './avatar.webp' },
  { width: 60, capabilities },
);

// 调用方决定如何显示
console.log(rendered.content);
```

强制指定模式：

```ts
const rendered = await renderImage(
  { path: './avatar.webp' },
  { mode: 'ascii', width: 80 },
);
console.log(rendered.content);
```

## API

### `detectTerminalCapabilities()`
返回终端能力信息，包括色彩等级、Unicode 支持和 TTY 信息。

### `chooseRenderer(capabilities, preferences?)`
返回 `truecolor`、`ansi256`、`ansi16`、`ascii` 之一。

### `renderImage(input, options?)`
按指定模式（或自动模式）渲染图像并返回：
- `content`：可直接输出的字符串
- `mode`：实际使用的模式
- 维度与能力元数据

重要说明：库 API 不直接写 stdout，而是返回字符串。调用方可自行 `console.log`、写文件或接入其他输出链路。

### `renderBestForTerminal(input, options?)`
依据自动检测（或传入）能力，选择最优渲染模式。

### ANSI 工具函数
- `styleText(text, options)` 能力感知的样式/颜色组合
- `stripAnsi(text)` 去除 ANSI 转义
- `resetAnsi()` 重置转义

## CLI 使用

### 自动渲染

```bash
ansie render ./avatar.webp --width 60
```

### 强制模式

```bash
ansie render ./avatar.webp --mode ascii --width 80
ansie render ./avatar.webp --mode ansi256 --width 80
```

### 输出到文件

```bash
ansie render ./avatar.webp --mode ascii --output ./avatar.txt
```

### 检测当前终端能力

```bash
ansie detect
```

### 样式工具

```bash
ansie style "Hello" --fg 255,120,10 --bold --underline
```

## 透明像素规则

- alpha 小于阈值的像素视为透明。
- ANSI 模式下，透明区域使用终端默认背景行为。
- ASCII 模式下，透明区域输出为空格。

## 开发

```bash
npm ci
npm run lint
npm run typecheck
npm run test:coverage
npm run build
```

覆盖率要求：
- 单元测试行、函数、分支、语句覆盖率均需保持在 90% 以上。

## 发布

发布流程使用 release-please：
- `release-please-config.json`
- `.release-please-manifest.json`
- `.github/workflows/release-please.yml`

合并到 `main` 后，release-please 负责版本与变更日志，并通过 trusted publishing 发布到 npm。

## 许可证

MIT
