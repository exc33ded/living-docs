# living-docs

A Claude Code plugin that keeps your project's `docs/` folder in sync with the code.

After a commit, it reads what changed, updates the docs that describe that code, removes references to files and functions that no longer exist, and writes down what it did in `docs/docs.log`.

It also keeps your `README.md` current: plain, step-by-step instructions for every way to run the project (for example with Docker and without), and screenshots of the app so readers can see what it looks like.

## How docs are organised

```
docs/
  non-technical/<topic>.md     what the product does and how to use it
  technical/
    frontend/<topic>.md
    backend/<topic>.md
    database/<topic>.md        any other area, created when the code has one
  docs.log                     what changed, when, and in which commit
```

Each doc starts with the code it describes:

```yaml
---
covers: [src/api/**, server.js]
---
```

When a covered file changes, that doc gets checked. When code appears that no doc covers, the plugin adds it to an existing doc or creates a new area folder for it.

## The README

`/living-docs:update-readme` checks what changed since the README was last edited. When the change affects how the project is installed, set up, started or what it looks like, it updates:

- **How to run:** one section per way the repo supports (with Docker, without Docker, ...). Each lists what to install first, numbered steps with the exact commands, how to tell it worked, and how to stop it. Every command is taken from the repo's own files, never made up.
- **Screenshots:** if the project has a UI and the UI changed (or there are no screenshots yet), it starts the app, captures the main screens into `docs/screenshots/`, and embeds them in the README. It uses a browser tool if your session has one, or `npx playwright screenshot`. If the app can't start, it keeps the old screenshots and tells you why.

Commits that don't affect any of this leave the README alone.

## Runs on Sonnet

Both skills set `model: sonnet`, so they run on Sonnet even if your session uses another model. Your session model comes back on your next message. The background git hook passes `--model sonnet` too. If your organisation's model allowlist blocks Sonnet, Claude Code ignores the setting and uses your session model.

## Install

In Claude Code:

```
/plugin marketplace add exc33ded/living-docs
/plugin install living-docs@living-docs
```

Needs Node.js on your PATH; the commit hook is a small Node script.

## Use

There are three ways it runs. Use whichever you like.

**1. By hand.** In any project, run:

```
/living-docs:update-docs
/living-docs:update-readme
```

On the first run it surveys the repo and writes the whole `docs/` folder. After that it only touches what changed since the last entry in the log.

**2. Automatically, while you work with Claude.** Installing the plugin adds a hook. When Claude makes a `git commit` that changed code, Claude is told to sync the docs and the README straight away, in the same session. Docs-only commits are ignored, so updating the docs never triggers another update.

**3. Automatically, for commits you make yourself (optional).** This git hook runs both syncs in the background with headless Claude after each of your commits:

```sh
curl -fsSL https://raw.githubusercontent.com/exc33ded/living-docs/main/githooks/post-commit -o .git/hooks/post-commit
chmod +x .git/hooks/post-commit
```

Output goes to `.git/update-docs.log`. It skips commits made inside Claude Code (option 2 handles those) and docs-only commits. Each code commit costs one Claude run. It doesn't take screenshots; run `/living-docs:update-readme` by hand for those.

## What it never does

It never commits. Doc changes are left in your working tree so you can review them first.

## The log

`docs/docs.log` is a plain-text log. Each sync appends an entry at the bottom:

```
== 2026-11-15 a1b2c3d  commits: a1b2c3d Add feed refresh; 9f8e7d6 Fix reader layout
updated  technical/backend/feeds.md      new per-feed refresh endpoint
created  technical/database/schema.md    no doc covered schema.sql
removed  technical/frontend/discover.md  refreshAll() is no longer in the code
```

The sha on the last `==` line is where the next sync starts from. To see the history:

```sh
grep '^== ' docs/docs.log          # every sync
tail -20 docs/docs.log             # the latest changes
grep schema.md docs/docs.log       # everything that happened to one doc
```

## License

MIT
