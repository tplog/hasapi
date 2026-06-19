# hasapi

One command to set up the [Pi](https://github.com/earendil-works/pi-mono) coding agent the way I like it — a curated set of extensions plus the `hasapi-*` skills, installed globally.

## Quick start

```bash
npx hasapi
```

It will:

1. Install `pi` for you if it isn't on PATH yet.
2. Install the curated pi extensions (`pi install <source>`).
3. Copy the bundled `hasapi-skills/` into `~/.pi/agent/skills/` and enable skill commands.

Install is **idempotent** — extensions already in your pi settings are skipped, and skills are re-copied so re-running updates them safely.

## Commands

| Command | What it does |
| --- | --- |
| `npx hasapi` | Install everything (extensions + skills) |
| `npx hasapi status` | Show which extensions/skills are installed |
| `npx hasapi remove` | Remove the hasapi extensions and skills |
| `npx hasapi doctor` | Check your environment for common problems |

## What gets installed

**Extensions** (`pi install`):

- `npm:pi-markdown-preview` — Markdown preview
- `npm:pi-notify` — desktop notifications
- `npm:@aliou/pi-processes` — background process management
- `npm:@plannotator/pi-extension` — planning and annotation workflow
- `npm:pi-mcp-adapter` — MCP server integration
- `npm:@narumitw/pi-goal` — goal tracking
- `npm:@juicesharp/rpiv-ask-user-question` — ask-user prompts
- `npm:context-mode` — context-mode tooling
- `npm:@narumitw/pi-btw` — side-chat popover
- `npm:pi-generative-ui` — generative UI
- `npm:glimpseui` — native UI widgets and dialogs
- `npm:pi-provider-kimi-code` — Kimi model provider
- `npm:pi-claude-bridge` — Claude Code provider bridge
- `npm:@narumitw/pi-chrome-devtools` — Chrome DevTools control

**Skills** — the `hasapi-skills/` bundle (diagnosis + implementation chain) copied to
`~/.pi/agent/skills/hasapi-skills/`. The folder moves as a unit so each skill's
`../_shared/*` references keep resolving.

## Editing the catalog

Extensions live in the `EXTENSIONS` array at the top of `bin/hasapi.mjs`. Add an entry
with an `id`, `source` (`npm:` or `git:`), and `description`.
