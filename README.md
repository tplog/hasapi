# hasapi

One command to set up the [Pi](https://github.com/earendil-works/pi-mono) coding agent the way I like it — a curated set of extensions, installed globally.

## Quick start

```bash
npx -y @tplog/hasapi
```

The `-y` flag skips npx's first-run install confirmation. Without it, an uncached or
non-interactive run can fail with `sh: hasapi: command not found`.

It will:

1. Install `pi` for you if it isn't on PATH yet.
2. Install the curated pi extensions (`pi install <source>`).

Install is **idempotent** — extensions already in your pi settings are skipped.

## Commands

| Command | What it does |
| --- | --- |
| `npx -y @tplog/hasapi` | Install the curated pi extensions |
| `npx -y @tplog/hasapi status` | Show which extensions are installed |
| `npx -y @tplog/hasapi remove` | Remove the hasapi extensions |
| `npx -y @tplog/hasapi doctor` | Check your environment for common problems |

## What gets installed

**Extensions** (`pi install`):

- `npm:pi-markdown-preview` — Markdown preview
- `npm:pi-notify` — desktop notifications
- `npm:@aliou/pi-processes` — background process management
- `npm:@plannotator/pi-extension` — planning and annotation workflow
- `npm:pi-mcp-adapter` — MCP server integration
- `npm:@narumitw/pi-goal` — goal tracking
- `npm:@juicesharp/rpiv-pi` — skill-based dev workflow (research → design → plan → implement → validate)
- `npm:context-mode` — context-mode tooling
- `npm:@narumitw/pi-btw` — side-chat popover
- `npm:pi-generative-ui` — generative UI
- `npm:glimpseui` — native UI widgets and dialogs
- `npm:pi-provider-kimi-code` — Kimi model provider
- `npm:@narumitw/pi-chrome-devtools` — Chrome DevTools control

## Editing the catalog

Extensions live in the `EXTENSIONS` array at the top of `bin/hasapi.mjs`. Add an entry
with an `id`, `source` (`npm:` or `git:`), and `description`.
