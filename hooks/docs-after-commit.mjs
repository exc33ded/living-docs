// PostToolUse hook: after Claude runs a `git commit` that changed code, tell Claude to run /update-docs.
// ponytail: also fires if the commit failed; the skill stops when the log already matches HEAD.
import { execSync } from 'node:child_process';

let input = '';
for await (const chunk of process.stdin) input += chunk;
const command = JSON.parse(input).tool_input?.command ?? '';
if (!/\bgit\s+(?:-[Cc]\s+\S+\s+)*commit\b/.test(command)) process.exit(0);

let files;
try {
  files = execSync('git diff-tree --no-commit-id --name-only -r HEAD', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
    .split('\n').filter(Boolean);
} catch { process.exit(0); } // not a repo, or no commits yet
if (!files.some(f => !f.startsWith('docs/'))) process.exit(0);

console.log(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'PostToolUse',
    additionalContext: 'A commit that changed code just landed. Run the update-docs skill to sync docs/ and log the changes.',
  },
}));
