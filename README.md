# Skilled

Cross-compatible Agent Skills marketplace for Claude Code and OpenAI Codex.

This repository is structured so it can be used in three ways:

- As a Claude Code plugin marketplace through `.claude-plugin/marketplace.json`
- As a Codex plugin marketplace through `.agents/plugins/marketplace.json`
- As a direct source of `SKILL.md` folders for Codex users who want to copy skills into `~/.agents/skills`

## Layout

```text
.
|-- .agents/plugins/marketplace.json        # Codex marketplace catalog
|-- .claude-plugin/marketplace.json         # Claude Code marketplace catalog
|-- plugins/shared-skills/
|   |-- .codex-plugin/plugin.json           # Codex plugin manifest
|   |-- .claude-plugin/plugin.json          # Claude Code plugin manifest
|   `-- skills/
|       |-- surface-churn/
|       |-- trace-value-debugging/
|       `-- worktree-protocol/
`-- scripts/
    |-- install-codex-skills.ps1
    |-- install-codex-skills.sh
    `-- validate-marketplace.mjs
```

## Install In Claude Code

After publishing this repository to GitHub, users can add it as a Claude Code marketplace:

```text
/plugin marketplace add MeatMan122/skilled
/plugin install shared-skills@skilled
```

For local testing before publishing:

```text
/plugin marketplace add .
/plugin install shared-skills@skilled
```

Claude Code expects a repository marketplace to contain `.claude-plugin/marketplace.json`. The catalog in this repo points to `./plugins/shared-skills`, which contains the installable plugin and its bundled skills.

## Install In Codex

Codex can add this repository as a plugin marketplace:

```bash
codex marketplace add MeatMan122/skilled
```

For local testing before publishing:

```bash
codex marketplace add .
```

After adding the marketplace, open Codex, run `/plugins`, and install the `shared-skills` plugin from the `Skilled` marketplace. Codex can also read repo marketplaces from `.agents/plugins/marketplace.json` when you work inside this repository.

For users who only want the raw skills without installing a plugin, copy the skill folders into the user skills directory:

```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/install-codex-skills.ps1
```

macOS/Linux:

```bash
./scripts/install-codex-skills.sh
```

The install scripts copy `plugins/shared-skills/skills/*` to `~/.agents/skills`, which Codex scans for user-level skills.

## Current Skills

- `surface-churn`: Surface assumptions, constraints, and friction when agent work starts looping.
- `trace-value-debugging`: Debug runtime behavior with bounded value traces and rate-limited diagnostics.
- `worktree-protocol`: Implement safely in reusable isolated Git worktrees and hand off local review branches.

### Worktree Protocol

`worktree-protocol` provides isolated implementation slots, task-owned local review branches, safe connected follow-ups, scoped verification, and process/dirty-state safeguards. It is portable across repositories and computers: resolve the primary checkout and project-specific tooling before using it. Bash examples work in Git Bash on Windows; PowerShell users should adapt the shell syntax.

After installing or updating the shared-skills bundle, invoke `$worktree-protocol` in Codex or ask Claude Code to use the `worktree-protocol` skill. The raw folder can also be copied to a project’s `.agents/skills/worktree-protocol/` rather than installed globally. It includes no external scripts or source-project dependencies.

## Add A Skill

1. Create a folder under `plugins/shared-skills/skills/<skill-name>/`.
2. Add a `SKILL.md` with YAML frontmatter containing `name` and `description`.
3. Optionally add `agents/openai.yaml` for Codex app display metadata.
4. Bump `plugins/shared-skills/.codex-plugin/plugin.json` and `plugins/shared-skills/.claude-plugin/plugin.json` versions when releasing.
5. Run validation:

```bash
npm run validate
```

## Validate Access

Run the repository validator:

```bash
npm run validate
```

If Claude Code is installed, also run:

```bash
claude plugin validate .
```

Then test the marketplace locally from Claude Code:

```text
/plugin marketplace add .
/plugin install shared-skills@skilled
```

For Codex, open this repository and run `/plugins`; the `Skilled` marketplace should list `shared-skills`.

## Documentation Sources

This scaffold follows current official docs:

- [OpenAI Codex Agent Skills](https://developers.openai.com/codex/skills)
- [OpenAI Codex Plugins](https://developers.openai.com/codex/plugins)
- [OpenAI Codex Build Plugins](https://developers.openai.com/codex/plugins/build)
- [Anthropic Agent Skills](https://docs.claude.com/en/docs/agents-and-tools/agent-skills)
- [Claude Code Skills](https://docs.claude.com/en/docs/claude-code/skills)
- [Claude Code Plugin Marketplaces](https://code.claude.com/docs/en/plugin-marketplaces)

## Publish Checklist

- Keep repository links and installation commands pointed at `MeatMan122/skilled`.
- Set the publisher name, website, privacy policy, and terms URLs if the marketplace is public.
- Tag releases and bump plugin versions before announcing updates.
- Keep skills auditable: avoid hidden network calls, unexpected file writes, or dependency installation in skill scripts.
