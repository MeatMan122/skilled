---
name: marketplace-maintainer
description: Maintain a cross-compatible Agent Skills marketplace for Claude Code and OpenAI Codex. Use when adding, updating, validating, packaging, or publishing SKILL.md skills, Claude Code plugin marketplace entries, or Codex plugin marketplace entries.
---

# Marketplace Maintainer

Use this skill to keep a repository installable by both Claude Code and Codex.

## Workflow

1. Read `references/compatibility.md` when you need exact layout or install-surface details.
2. Put shared skills under `plugins/shared-skills/skills/<skill-name>/`.
3. Ensure each skill has a `SKILL.md` with only `name` and `description` in YAML frontmatter unless a target surface explicitly needs more fields.
4. Keep skill names lowercase, hyphenated, and under 64 characters.
5. Write descriptions that include both what the skill does and when it should trigger.
6. Add `agents/openai.yaml` for Codex display metadata when the skill should appear polished in the Codex app.
7. Update both plugin manifests when releasing:
   - `plugins/shared-skills/.claude-plugin/plugin.json`
   - `plugins/shared-skills/.codex-plugin/plugin.json`
8. Update both marketplace catalogs when adding or renaming plugin bundles:
   - `.claude-plugin/marketplace.json`
   - `.agents/plugins/marketplace.json`
9. Run `npm run validate`.
10. If Claude Code is available, also run `claude plugin validate .`.

## Release Checks

- Verify Claude install commands in `README.md` use the final GitHub `OWNER/REPO`.
- Verify Codex instructions mention `/plugins` for plugin installation and `~/.agents/skills` for direct skill-copy installation.
- Bump plugin versions whenever published skill contents change.
- Keep scripts auditable. Avoid hidden network calls, destructive file operations, and global package installation.
- Treat marketplace skills as privileged instructions and code; review all bundled files before release.
