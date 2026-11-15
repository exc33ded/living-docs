---
name: update-docs
description: Keep docs/ in sync with the code. Reads what changed since the last sync, updates the affected docs, removes references to code that no longer exists, creates folders for new code areas, and logs every change in docs/docs.log. Use when the user says "update docs", "/update-docs", "sync docs", or after a commit that changed code.
---

# Update docs

## Layout

```
docs/
  non-technical/<topic>.md     what the product does and how to use it, no code
  technical/
    frontend/<topic>.md
    backend/<topic>.md
    <area>/<topic>.md          any other code area (database, workers, ...), made when needed
  docs.log                     plain-text log, newest entry at the bottom
```

Folders follow the code, at every level:

- **New area:** a new kind of code (database, workers, CLI, infra) gets its own `technical/<area>/`.
- **Inside an area:** when the code has its own structure, mirror it in subfolders, e.g. `backend/api/`, `backend/jobs/`, `frontend/components/`, `frontend/pages/`. The same goes for `non-technical/` when a product area has several topics.
- **When a topic grows:** once a doc runs past about a page, split it into a folder, e.g. `backend/auth.md` becomes `backend/auth/overview.md` and `backend/auth/tokens.md`.
- **No folders for one short doc.** A folder needs at least two docs in it.
- **Moving or splitting a doc:** carry its `covers` over, fix every link to it in `docs/`, and log the move.

Every technical doc starts with front matter that lists the code it describes:

```yaml
---
covers: [server.js, schema.sql]
---
```

`covers` takes paths or globs. It is how a code change is matched to the docs it affects. Non-technical docs also have `covers`, pointing at the code behind the user-facing feature.

## Steps

1. **Find the sync point.** Run `grep '^== ' docs/docs.log | tail -1`. That is the last entry's first line, and its third field is the commit sha the docs were last synced to.
   - No `docs/` or no log yet: do the **first run** below instead.
   - That sha equals `git rev-parse --short HEAD`: say the docs are already up to date, and stop.
   - **That commit no longer exists** (`git cat-file -e <sha>^{commit}` fails, usually because history was squashed, rebased or reset): tell the user the sync point is gone. Then use as the sync point the newest commit made before that entry's date: `git rev-list -1 --before="<entry date> 00:00" HEAD`. That may re-check a few changes that were already synced, which is harmless.
     - If that finds nothing (every commit is newer), there is no base to compare from. Run a **full check** instead: treat every doc in `docs/` as affected, then do steps 4 and 5 against the current code. Rebuild nothing from scratch.
     - Either way, note it in the log entry's first line, e.g. `commits: sync point 9f8e7d6 not found, compared from 4c3b2a1; …` or `commits: sync point 9f8e7d6 not found, full check`.

2. **Read what changed.** Run `git log --oneline <sha>..HEAD` and `git diff --stat <sha>..HEAD -- . ':!docs'`. If nothing outside `docs/` changed, add no log entry, say so and stop. Otherwise read the full diff for each changed file. The commit messages explain why each change was made. Use them.

3. **Match changes to docs.** Glob every `covers` in `docs/` and list the docs whose paths changed. For a changed path no doc covers:
   - If it belongs to an existing area, add it to the best doc's `covers`, or write a new topic doc in that area.
   - If it is a new kind of code (a new layer such as a database or worker), create `docs/technical/<area>/` with a first doc for it.
   - If it is a new part of an existing area (e.g. a new `src/api/` directory in the backend), create the matching subfolder, e.g. `technical/backend/api/`, following the folder rules above.
   - After updating, if a doc has grown past about a page, split it into a folder.
   - Skip changes with nothing to document (formatting, tests that only add cases, lockfiles).

4. **Update each affected doc.** Rewrite only the sections the change made wrong or incomplete. Keep the existing tone and structure. If a user-visible behaviour changed, update the matching `non-technical/` doc too.

5. **Remove stale references.** In every doc you touched, and in any other doc whose `covers` includes a changed or deleted file, check every file path, function, endpoint, table, env var and setting it names in backticks. Grep the code for each one. If it no longer exists, fix the doc to describe what replaced it, or delete the passage. Never leave a doc describing code that is gone. Also drop dead paths from `covers`.

6. **Log it.** Append a new entry to the end of `docs/docs.log`. Never edit old entries.

   ```
   == 2026-11-15 a1b2c3d  commits: a1b2c3d Add feed refresh; 9f8e7d6 Fix reader layout
   updated  technical/backend/feeds.md      new per-feed refresh endpoint
   created  technical/database/schema.md    no doc covered schema.sql
   removed  technical/frontend/discover.md  refreshAll() is no longer in the code
   moved    technical/backend/auth.md -> technical/backend/auth/overview.md  grew past a page
   ```

   The first line is `== <today's date> <short sha of HEAD>  commits: <each commit since the sync point>`. Then add one line per doc changed: the action (`created`, `updated`, `removed`, `moved`, `deleted`), the path relative to `docs/`, and why. Leave a blank line before the entry.

7. **Do not commit.** Leave the changes for the user to review, then tell them which docs changed.

## First run

When `docs/` or the log does not exist:

1. Survey the repo: `git ls-files`, the README and any product notes, and the main entry points.
2. Decide the areas from the code you find (usually frontend and backend, plus any others such as database), and the non-technical topics from the product's features.
3. Write each doc with its `covers` front matter. Describe what the code does and how the parts connect, not every line.
4. Create `docs/docs.log`. Start it with the comment line `# docs.log: one entry per sync, newest at the bottom. The last "==" line is the sync point.`, then add a first entry for HEAD (`commits: first run`) that lists every doc created.
