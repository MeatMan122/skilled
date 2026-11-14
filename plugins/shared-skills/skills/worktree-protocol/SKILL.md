---
name: worktree-protocol
description: "Implement changes in an isolated Git worktree and publish or update the task's local review branch. Use for /worktree-protocol or $worktree-protocol, separate-worktree requests, worktree environment/tooling setup, or local review handoffs. Connected follow-ups may land in the primary checkout when it is already on the review branch created for that work."
---

# Worktree Protocol

## Overview

Use this protocol to do implementation work in an isolated git worktree, then publish the finished commit as a local `review/<feature>` branch in the shared repository. Keep connected follow-up changes on that same review branch.

If the primary checkout is already on the review branch created for this work, the user gives standing authorization to land verified connected changes there without asking again. Continue implementing and resolving conflicts in isolation, then fast-forward the checked-out review branch through normal Git operations. The user may have left that branch checked out while working on something else; this alone is not a reason to create another review branch.

Otherwise, leave the primary checkout untouched and update the existing unoccupied review ref, or create one for new work. This authorization does not include switching the primary checkout, integrating into main, pushing, or deploying.

Use this protocol within the user’s current instructions and applicable tool permissions. Installing a skill does not grant permission to push, deploy, delete work, or bypass a required approval.

## Non-Negotiables

- Keep implementation edits in the isolated worktree. Landing connected follow-ups into the primary checkout is authorized when it is already on this task's review branch, subject to Step 7's ownership, dirty-state and ancestry checks. An explicit request to prepare a base commit, edit in the primary checkout, or integrate into main also authorizes that named operation. Preserve unrelated work and do not ask again for an already-authorized local integration.
- Do not check out `review/<feature>` in the primary worktree merely to publish a review ref. Follow an explicit user request to switch or integrate.
- Do not open a pull request unless the user explicitly asks.
- Do not print `.env` contents or secrets in terminal output, summaries, commits, or branch names.
- Do not copy uncommitted primary-worktree changes into the new worktree unless the user explicitly asks. If the task appears to depend on uncommitted changes, stop and ask.
- Do not delete or reuse another agent's worktree. If an implementation path or branch belongs to another task, choose a unique suffix or ask. A checked-out review branch for connected work follows Step 7; do not create a second review branch merely because it is checked out.
- Do not leave worktree-only dev servers, watchers, or smoke-test processes running at handoff unless the user explicitly asks for a live server to remain available.
- Do not stop or restart processes that were already running before the work began unless the user explicitly asks. If the review branch will need those existing processes restarted after branch switch, say so in the final response.

## Names And Locations

- Treat the user's normal checkout as the **primary worktree**. Identify it with `git worktree list --porcelain` and the user’s project context; do not assume the current directory is the primary checkout. Set `PRIMARY` to its absolute path and use it throughout this protocol.
- Put persistent isolated worktree slots under `${PRIMARY}/.worktrees/<slot>`.
- Maintain the default slot pool as `A`, `B`, and `C`. Create additional lettered slots such as `D`, `E`, and `F` only when the existing slots needed for the task are actively assigned to agents in the current run or bakeoff.
- Derive `<feature-slug>` from the requested feature: lowercase, hyphen-separated, alphanumeric plus `-`, short enough for a readable branch name.
- Use a temporary implementation branch such as `codex/worktree-<feature-slug>`.
- Publish the review ref as `review/<feature-slug>`.
- For connected follow-ups, retain the existing review branch name instead of creating names such as `review/<feature>-art` or another numbered review branch.

If a name already exists, inspect its ownership and history. Reuse the known review ref for connected work. For unrelated name collisions or occupied implementation branches, prefer a short numeric suffix over deleting, resetting or repurposing them. A `review/` prefix alone does not establish that a branch belongs to this task.

The command examples use Bash, available on macOS/Linux and Git Bash on Windows. In PowerShell, adapt variable assignment and loops rather than pasting Bash syntax. All paths are project-local; do not assume a home directory, drive letter, package manager, language runtime, or default branch name. Establish `PRIMARY` once from the inspected worktree list (for example `PRIMARY="/absolute/path/to/project"`). Substitute the repository’s actual integration branch wherever examples say `main`. Ensure `.worktrees/` is ignored before creating slots inside the primary checkout; use the repository’s existing location policy when different.

## Persistent Slot Pool

Worktree slots are reusable workstations. Branches and old commits may remain in them between tasks; that alone does not mean the slot is occupied.

- A slot is idle if no agent is currently assigned to or actively working in it.
- Dirty files, old branches, unmerged review work, or abandoned experiments do not by themselves make a slot non-idle. They are state to inspect and handle before beginning new work.
- If a clean idle slot exists, check out or create the new task branch there and start work without recreating the worktree, reinstalling dependencies, or recopying env files.
- If an idle slot has dirty files, report the status. Do not stash, clean, reset, overwrite, or commit that state without explicit user direction. Prefer another idle clean slot if one exists; if no idle clean slot exists, ask before creating extra capacity just to avoid the dirty state.
- For multi-agent bakeoffs, assign slots explicitly: agent 1 gets `A`, agent 2 gets `B`, agent 3 gets `C`. If more active agents are required, create the next lettered slots.
- Do not delete an existing slot just because its branch is old or no longer intended for integration. Old committed work can stay parked until the user asks for cleanup.

## Subagent Launch Notes

When delegating this protocol to subagents with the multi-agent tool:

- Delegate only when the user and active environment instructions permit it. Use the current tool schema rather than copying old `items`/`fork_context` recipes; full-history forks inherit their settings where the tool specifies that behavior.
- Include the base commit, feature slug, assigned slot such as `.worktrees/A`, verification commands, screenshot expectations, and the warning that other agents may be working in separate slots.

## Task Scope And Verification

Before implementation, classify the task and choose the smallest proof that shows the requested change worked. Use the repo's normal final gates when they are relevant, but avoid repeatedly running heavyweight checks during narrow visual iteration before the visual result has been inspected.

Ask and answer these questions in working notes:

- What kind of task is this: UI polish, gameplay logic, server/network, physics, test-only, docs-only, build/config, or mixed?
- What is the smallest proof that this worked?
- Does the user need a screenshot, a running server, a branch, a commit, or a PR?
- Are full tests required by user instruction for this pass, or is scoped verification acceptable until the final gate?
- What would be overkill for this change?

Follow the target repository’s testing policy and relevant `AGENTS.md` instructions. Do not assume this skill’s source project’s commands exist. Suggested verification by task type:

- Docs-only or protocol text: inspect the diff and affected links/commands; skip application tests.
- Config changes: run the configuration validator or smallest affected scenario required by the repository.
- UI or visual changes: inspect repeatable screenshots and exercise real controls when interactions changed; run the project’s relevant type/build checks.
- Gameplay, server/network, persistence, physics or movement changes: run relevant integration scenarios and the repository’s final gates for shared behavior changes.
- Test/script changes: run the changed command or affected tests. Build/dependency/tooling changes should also run application checks when that surface is affected.

For UI-polish passes, write a tiny visual checklist before editing and keep one repeatable screenshot command for the pass. For menu/panel polish, include concrete acceptance points when relevant:

- Panel opacity is readable.
- Top border is continuous.
- Banner overlaps the upper panel as requested.
- Back button is centered.
- Requested ornaments are visible without breaking the frame.

Compare the screenshot against the checklist before doing docs updates, commits, branch publication, or broader verification.

## Workflow

### 1. Inspect The Primary Worktree

Find the primary root, current branch, current commit, and worktree state:

```bash
git -C "${PRIMARY}" worktree list --porcelain
git -C "${PRIMARY}" status --short
git -C "${PRIMARY}" rev-parse --abbrev-ref HEAD
git -C "${PRIMARY}" rev-parse HEAD
```

Use the current primary `HEAD` as the base for new work by default. For connected follow-ups, identify the review branch from the conversation or prior handoff, record its current tip, and base the work on it or the continuing implementation branch that contains it. Record the intended review branch before starting; do not infer ownership from its name alone. Dirty primary-worktree files are intentionally ignored unless the user explicitly wants them included, and they must be preserved when landing later.

If the primary worktree is dirty and the task appears to depend on those changes, stop before creating worktrees and ask for one of these explicit choices:

- Commit selected primary changes and use that commit as the base.
- Ignore the dirty state and branch from current `HEAD`.
- Include the working tree in some other user-approved way.

If the user chooses a base commit, inspect the diff, stage only intended files, commit with a clear message, record the new `HEAD`, and then create isolated worktrees from that commit.

Also snapshot relevant running processes before starting any dev server, watcher, browser smoke test, or long-running helper. At minimum, check the project's normal ports and any alternate ports you plan to use:

Use the platform’s process/port tools, such as `lsof -nP -i tcp:<port>` on macOS/Linux or `Get-NetTCPConnection -LocalPort <port>` plus `Get-Process` on Windows. Choose ports from the actual project configuration, not fixed defaults.

Record this baseline in your working notes. Treat anything present in the baseline as user-owned or pre-existing, and leave it running unless the user asks otherwise.

### 2. Select Or Create A Worktree Slot

Inspect the persistent slot pool and pick an idle slot. Prefer `A`, then `B`, then `C`:

```bash
git -C "${PRIMARY}" worktree list --porcelain
for slot in A B C; do
  if [ -d "${PRIMARY}/.worktrees/$slot" ]; then
    git -C "${PRIMARY}/.worktrees/$slot" status --short
  fi
done
```

If a clean idle slot already exists, reuse it. Check out a fresh task branch from the base identified in Step 1 without network fetch or dependency setup. These examples use primary `HEAD` for new work; substitute the verified review/implementation tip for a connected follow-up:

```bash
git -C "${PRIMARY}/.worktrees/A" switch --detach "$(git -C "${PRIMARY}" rev-parse HEAD)"
git -C "${PRIMARY}/.worktrees/A" switch -c "codex/worktree-<feature-slug>"
```

Create a slot when an assigned bakeoff/subagent needs more capacity than the currently idle slots provide. Initialize missing default slots first:

```bash
mkdir -p "${PRIMARY}/.worktrees"
git -C "${PRIMARY}" worktree add \
  -b "codex/worktree-<feature-slug>" \
  "${PRIMARY}/.worktrees/A" \
  "$(git -C "${PRIMARY}" rev-parse HEAD)"
```

When reusing a slot, switching branches is expected. Do not delete old branches just to start new work. If the target branch name already exists, inspect it and choose a short numeric suffix rather than force-resetting it.

### 3. Copy Local Environment Files

Copy necessary local env files from the primary worktree into a newly created slot without printing contents. Skip this step for a reused slot when the files are already present and current:

```bash
for file in .env .env.local .env.development .env.test .env.production.local; do
  if [ -f "${PRIMARY}/$file" ]; then
    cp -p "${PRIMARY}/$file" "${PRIMARY}/.worktrees/A/$file"
  fi
done
```

Also copy project-local tool config that is ignored or machine-specific when present, such as `.npmrc`, only if needed for normal commands. Never stage copied env files. Before committing, verify they are ignored or explicitly exclude them from staging.

Check only the environment variable names required by the target project’s setup documentation; never display secret values. Do not overwrite a reused slot’s existing configuration without checking its ownership and purpose.

### 4. Prepare Tooling In The Worktree

Run all development commands from the isolated worktree.

Read the repository’s runtime/version files, package manifests and setup instructions. Use any project-provided runtime wrapper. Confirm required tools and versions without changing global defaults.

Install dependencies inside the isolated worktree only when required by the repository or when dependency inputs changed since the slot was last prepared. Use the project’s lockfile-aware install command and avoid mixing package managers. If a network or sandbox permission is needed, request it through the supported mechanism. Reuse only dependencies that are safe to share; do not assume `node_modules`, a virtual environment, build products or platform-specific binaries are portable between computers.

### 5. Do The Work In Isolation

Implement the requested changes only inside the assigned slot, such as `${PRIMARY}/.worktrees/A`.

For comprehensive code changes, run the repository’s final gates from the assigned worktree; use scoped verification during iteration. Record the actual commands and outcomes rather than substituting commands from a different project.

If the task requires a dev server or visual QA, first prefer using the existing user-owned server when that is compatible with the review workflow. When isolated worktree servers are necessary, run them on free alternate ports, track the exact session IDs or PIDs you started, and stop them before final response. Re-check the ports afterward to prove your own processes are gone.

For server-backed checks, isolate both client and server when another task may switch or restart the primary checkout. Point the isolated client at its own server; a separate frontend port alone does not isolate backend state. Avoid editing watched source while a browser probe runs, since hot reload can invalidate the scene being checked.

Save visual evidence to the project’s artifact directory when supported. If browser tooling requires temporary storage, use the platform’s supported temporary directory and copy the captured image into the worktree. Use the repository’s screenshot-labeling helper only if it exists. Do not copy machine-specific Python paths or assume a Unix temporary directory on Windows.

If the user is expected to switch to the review branch to inspect the work, do not leave alternate worktree servers running for them. They should use the existing dev process when possible; if a server restart is required after switching branches, state that clearly in the final response.

### 6. Commit In The Worktree

Inspect the diff from the isolated worktree, stage only intended files, and commit there:

```bash
git -C "${PRIMARY}/.worktrees/A" status --short
git -C "${PRIMARY}/.worktrees/A" diff
git -C "${PRIMARY}/.worktrees/A" add <intended-files>
git -C "${PRIMARY}/.worktrees/A" commit -m "<clear commit message>"
```

Before committing, confirm no `.env*` files or local machine-only files are staged:

```bash
git -C "${PRIMARY}/.worktrees/A" diff --cached --name-only
```

### 7. Publish Or Update The Existing Review Branch

Use the review branch recorded in Step 1. For a first handoff, create it at the validated implementation commit without switching the primary checkout:

```bash
COMMIT="$(git -C "${PRIMARY}/.worktrees/A" rev-parse HEAD)"
git -C "${PRIMARY}" branch "review/<feature-slug>" "$COMMIT"
git -C "${PRIMARY}" rev-parse --short "review/<feature-slug>"
```

For connected follow-ups, update that review branch rather than creating another one. Re-read worktree ownership, the primary branch/status, and both tips before landing:

- **Review branch is not checked out:** preserve any commits added to it. If its tip is an ancestor of the validated implementation commit, advance the ref using an expected-old-tip guard (for example, `git update-ref` with the previously read review tip). If histories diverged, combine them in isolation and validate the affected overlap before advancing it. Do not force-replace an existing review history.
- **Primary checkout is already on this task's review branch:** land the connected changes there using the procedure below. This is already authorized; do not ask for confirmation or create a second review branch simply because the primary checkout is on the first one.
- **Review branch is checked out in another task's worktree, or ownership is unclear:** do not mutate that checkout or move its ref behind it. Continue useful work in isolation and resolve the ownership/blocking condition before landing. Do not silently fork a connected feature into another review branch to avoid the condition.

#### Landing into the checked-out review branch

1. Confirm that the exact primary branch is the review branch created for this work, using the conversation, recorded handoff and commit history. Inspect its index, working-tree changes and untracked files. A clean checkout is preferred, but unrelated uncommitted work need not block landing: record its contents and staged/unstaged status, and proceed only if the landing leaves it unchanged. Do not stash, reset, overwrite or commit that work. If it overlaps the landing or Git refuses to preserve it, continue in isolation and ask only about the blocking state; do not create another review branch as a workaround.
2. Ensure the validated implementation commit contains the current review tip. If the review branch acquired other commits or diverged, incorporate them in the isolated worktree, resolve conflicts there, inspect the combined changes and run verification appropriate to the overlap. A clean textual merge is not sufficient evidence of compatibility. Set `COMMIT` to the validated isolated-worktree `HEAD`, refreshing it after any integration.
3. Immediately before landing, re-read the primary branch, dirty state and review tip. If they changed, reassess instead of continuing with stale assumptions. With the same review branch checked out, ancestry verified and any uncommitted work confirmed unaffected, fast-forward it through the primary worktree. Do not override a Git refusal:

```bash
git -C "${PRIMARY}" merge --ff-only "$COMMIT"
```

4. Verify the primary checkout remains on the intended review branch and contains the validated commit and any intervening review commits. Confirm it is clean if it started clean, or that the recorded unrelated contents and staged/unstaged status are preserved exactly. Stop only task-owned temporary processes. Report the branch, landed commit and actual checkout state; mention a required dev-server restart if applicable.

If the primary checkout is on main or an unrelated branch, leave it there. Update the unoccupied task review ref as above; the user can switch to it when ready. This follow-up authorization does not permit switching branches for them or landing on main.

### 8. Integrate Into Main When Requested

An explicit request such as “merge it to main” authorizes local integration, not a remote push. Do not stop at publishing another review branch.

1. Re-read primary status, worktree ownership, and the current `main` and feature tips. Inspect commits added to main since the feature diverged, especially overlapping files. Do not reset or force checkout over dirty work.
2. For diverged histories, prepare an integration branch from current main in your assigned clean slot, merge the reviewed branch there, and inspect the combined diff. Preserve both features; a clean textual merge is not proof of behavioral compatibility.
3. Validate the combined tree with checks appropriate to the overlap. Documentation-only integration needs link/content/diff checks; shared gameplay changes need type checks, relevant tests, and live boundary checks where warranted. Do not repeat completed checks unless new changes or failures justify them.
4. Commit the validated integration, then re-read main immediately before landing. Fast-forward main to the validated commit only if the checked main tip is still its ancestor. If main advanced incompatibly, incorporate those changes and verify the affected surface before retrying.
5. When the primary checkout is available, switch it to main and fast-forward. If the user is now inspecting another branch, preserve that review: update an unoccupied main ref only after verifying ancestry and using an expected-old-tip guard. Never move a branch ref behind a worktree that has it checked out. Use normal checkout/merge operations there or wait for the conflicting work to finish.
6. Verify main contains the reviewed feature and the newer main commits, inspect final status, and stop only your own temporary processes. Report the landed commit, checkout state, and whether anything was pushed.

## Final Response

Report:

- The review branch name: `review/<feature-slug>`
- The commit hash, preferably short plus full if useful
- The worktree slot and path where the implementation was done
- Verification commands run and whether they passed
- Any env/tooling caveats, without secret values

For a handoff that only updates an unoccupied review ref, do not claim the primary checkout changed. When connected changes were landed into the primary checkout's existing review branch, report that actual branch/commit and its final status. After an explicitly requested main integration or primary edit, report the actual main/checkout state instead.
