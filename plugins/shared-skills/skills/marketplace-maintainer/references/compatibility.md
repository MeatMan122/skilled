# Claude Code And Codex Compatibility

## Shared Skill Format

Both Claude Code and Codex can use Agent Skills as folders containing a required `SKILL.md` and optional bundled resources such as `scripts/`, `references/`, and `assets/`.

Minimum `SKILL.md`:

```markdown
---
name: my-skill
description: What this skill does and when to use it.
---

# My Skill

Follow these instructions.
```

## Claude Code

- User skills can live in `~/.claude/skills/`.
- Project skills can live in `.claude/skills/`.
- Plugin skills are bundled in an installable Claude Code plugin.
- A marketplace repository must include `.claude-plugin/marketplace.json`.
- Users add a GitHub-hosted marketplace with `/plugin marketplace add OWNER/REPO`.
- Users install a plugin with `/plugin install plugin-name@marketplace-name`.

## Codex

- Repo skills can live in `.agents/skills`.
- User skills can live in `~/.agents/skills`.
- Reusable distribution should use a plugin with `.codex-plugin/plugin.json`.
- Repo marketplaces live at `.agents/plugins/marketplace.json`.
- Codex plugin marketplace entries must include `policy.installation`, `policy.authentication`, and `category`.
- `agents/openai.yaml` inside a skill can define Codex UI metadata and invocation policy.

## This Repository

- `plugins/shared-skills/skills/` is the source for installable skills.
- `.claude-plugin/marketplace.json` exposes `shared-skills` to Claude Code.
- `.agents/plugins/marketplace.json` exposes `shared-skills` to Codex.
- `scripts/install-codex-skills.*` copies raw skills into the Codex user skills directory.

## Official References

- OpenAI Codex skills: https://developers.openai.com/codex/skills
- OpenAI Codex plugins: https://developers.openai.com/codex/plugins
- OpenAI Codex plugin build guide: https://developers.openai.com/codex/plugins/build
- Anthropic Agent Skills: https://docs.claude.com/en/docs/agents-and-tools/agent-skills
- Claude Code skills: https://docs.claude.com/en/docs/claude-code/skills
- Claude Code plugin marketplaces: https://code.claude.com/docs/en/plugin-marketplaces
