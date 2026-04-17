# Repository Guidance

This repository is a dual Claude Code and Codex Agent Skills marketplace.

When adding or changing skills:

1. Keep installable skills under `plugins/shared-skills/skills/<skill-name>/`.
2. Every skill must include `SKILL.md` with YAML frontmatter fields `name` and `description`.
3. Skill names must use lowercase letters, digits, and hyphens only.
4. Descriptions should say what the skill does and when an agent should use it.
5. Add `agents/openai.yaml` for Codex display metadata when the skill should look polished in the Codex app.
6. Keep Claude and Codex plugin manifests in sync:
   - `plugins/shared-skills/.claude-plugin/plugin.json`
   - `plugins/shared-skills/.codex-plugin/plugin.json`
7. Keep marketplace catalogs in sync:
   - `.claude-plugin/marketplace.json`
   - `.agents/plugins/marketplace.json`
8. Run `npm run validate` before finishing.
9. If Claude Code is available, also run `claude plugin validate .`.

Surface notes:

- Claude Code marketplace repositories must expose `.claude-plugin/marketplace.json`; plugin skills are bundled under the plugin's `skills/` directory.
- Codex marketplace repositories must expose `.agents/plugins/marketplace.json`; plugin bundles need `.codex-plugin/plugin.json`.
- Codex marketplace entries must include `policy.installation`, `policy.authentication`, and `category`.
- Direct Codex skill installs copy `plugins/shared-skills/skills/*` into `~/.agents/skills`.
- README install commands should use the final GitHub `OWNER/REPO` before release.

Release checks:

- Bump both plugin manifest versions whenever published skill contents change.
- Verify install instructions for Claude Code, Codex marketplace installs, and direct Codex skill-copy installs.
- Prefer small, focused skills.
- Treat bundled scripts as code that users install on their machine, and keep them auditable.
- Avoid hidden network calls, destructive file operations, and global package installation in skill scripts.
