---
name: update-readme
description: Keep README.md in sync with the code. Checks what changed since the README was last touched, rewrites the "How to run" section in plain steps for every way the project can be run (e.g. with Docker and without), and takes screenshots of the app's UI and embeds them. Use when the user says "update readme", "/update-readme", "sync readme", or after a commit that changed code.
model: sonnet
---

# Update README

The README is for someone who has never seen the project. It answers three questions, in this order: what is this, what does it look like, how do I run it. Keep anything else the README already has (badges, license, credits) and do not rewrite sections the code change did not affect.

## Steps

1. **Find what changed.** Run `git log -1 --format=%h -- README.md` to get the last commit that touched the README. Then run `git log --oneline <sha>..HEAD` and `git diff --stat <sha>..HEAD -- . ':!docs' ':!README.md'`.
   - No README yet, or that command prints nothing: write the whole README (see **Sections** below).
   - Otherwise read the diffs that matter for the README: anything that changes how the project is installed, configured, started or what it looks like. That means dependency files (`package.json`, `requirements.txt`, `pyproject.toml`, `go.mod`, ...), `Dockerfile` and `docker-compose*.yml`, `Makefile`, scripts, `.env.example`, ports, entry points, CLI flags, and UI code.
   - **Before stopping, check what the README is missing**, whatever the diff says: a "How to run" section that covers every way the repo can be run (see **Sections**), and, if the project has a UI, screenshots. Add anything missing even when no code changed.
   - Stop only when none of those files changed and nothing is missing. Say the README is up to date. Most commits end here.

2. **Update the sections the change made wrong.** Follow **Sections** below. Every command you write must come from a file in the repo (a script in `package.json`, a target in the `Makefile`, a service in `docker-compose.yml`, ...). Never invent a command, port, or env var. Grep for each one before writing it down, and remove any the README names that no longer exist.

3. **Screenshots**, only when the project has a UI (web pages, desktop or terminal UI) and either UI code changed or the README has no screenshots yet. See **Screenshots** below. If you skip screenshots, say why in one line (no UI, nothing changed, app would not start, no screenshot tool).

4. **Do not commit.** Leave the changes for the user to review, then tell them what changed in the README and why.

## Sections

**What it is.** One or two sentences in plain words: what the project does and who it is for.

**Screenshots.** Right after the intro, so readers see the app before the setup steps.

**How to run.** Find every way the repo supports running the project and give each one its own subsection with a clear name, e.g. `### With Docker` and `### Without Docker (on your computer)`. Check for:
- Docker: `Dockerfile`, `docker-compose.yml` / `compose.yaml`
- Running locally: the language toolchain and its dependency file, plus the start script
- Any other supported way (a `Makefile`, a dev container, a hosted one-click deploy)

If there is only one way, write one subsection. If both Docker and local are supported, say in one line which to pick: "Docker is easiest if you have it installed; otherwise use the local steps."

Each subsection is:
1. **What you need first**, with versions taken from the repo (e.g. `engines` in `package.json`, `python_requires`, `.nvmrc`, the `FROM` image), and a link to where to get each one.
2. **Numbered steps**, one action per step, each with the exact command in a code block. Include copying `.env.example` to `.env` and say which values the user must fill in and where to get them.
3. **How to know it worked:** the URL to open, or what the terminal prints.
4. **How to stop it**, when that is not obvious (e.g. `docker compose down`).

Write for a beginner: short sentences, everyday words, no jargon without a one-line explanation. Commands that differ by OS (Windows vs macOS/Linux) get both versions.

## Screenshots

1. **Start the app** with the local or Docker steps from the README. Run it in the background and wait until it answers (e.g. `curl` the URL until it returns).
2. **Capture each main screen** (home page plus the two or three most important views; not every page). Use whatever is available, in this order:
   - a browser tool in this session (e.g. Claude in Chrome, a Playwright MCP): open the page, take the screenshot, save it as a file
   - the Playwright CLI: `npx -y playwright screenshot --viewport-size=1280,800 <url> docs/screenshots/<name>.png`
   - for a terminal UI: run the command and save its output as a text block in the README instead of an image
3. **Save** images as `docs/screenshots/<screen-name>.png`, with short lowercase names (`home.png`, `settings.png`). Overwrite old ones of the same screen and delete images of screens that no longer exist.
4. **Embed** them in the README with relative paths and a caption that says what the screen is for:

   ```markdown
   ![Home page: the list of your saved feeds](docs/screenshots/home.png)
   ```

5. **Stop the app** and any containers you started.

If the app cannot start (missing secrets, a database you cannot run) or no screenshot tool works, keep the existing screenshots, tell the user why you could not take new ones, and carry on with the text.

Use fake sample data only. Never screenshot a page showing real user data, secrets, or tokens.
