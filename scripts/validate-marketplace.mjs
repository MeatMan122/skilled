import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function readJson(relativePath) {
  const filePath = path.join(root, relativePath);
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`${relativePath}: ${error.message}`);
    return null;
  }
}

function exists(relativePath, label = "path") {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) {
    errors.push(`Missing ${label}: ${relativePath}`);
    return false;
  }
  return true;
}

function resolveRepoPath(relativePath) {
  return path.join(root, relativePath.replace(/^\.\//, ""));
}

function validateSkill(skillPath) {
  const skillMd = path.join(skillPath, "SKILL.md");
  if (!fs.existsSync(skillMd)) {
    errors.push(`Missing SKILL.md in ${path.relative(root, skillPath)}`);
    return;
  }

  const content = fs.readFileSync(skillMd, "utf8");
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) {
    errors.push(`${path.relative(root, skillMd)}: missing YAML frontmatter`);
    return;
  }

  const frontmatter = Object.fromEntries(
    match[1]
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf(":");
        if (separator === -1) return [line.trim(), ""];
        return [
          line.slice(0, separator).trim(),
          line.slice(separator + 1).trim().replace(/^"|"$/g, ""),
        ];
      }),
  );

  const name = frontmatter.name;
  const description = frontmatter.description;

  if (!name) errors.push(`${path.relative(root, skillMd)}: missing name`);
  if (!description) errors.push(`${path.relative(root, skillMd)}: missing description`);
  if (name && !/^[a-z0-9-]{1,64}$/.test(name)) {
    errors.push(`${path.relative(root, skillMd)}: invalid skill name "${name}"`);
  }
  if (description && description.length > 1024) {
    errors.push(`${path.relative(root, skillMd)}: description exceeds 1024 characters`);
  }

  const folderName = path.basename(skillPath);
  if (name && name !== folderName) {
    errors.push(`${path.relative(root, skillMd)}: name "${name}" does not match folder "${folderName}"`);
  }
}

function validateSkillsDirectory(relativePath) {
  const skillsPath = resolveRepoPath(relativePath);
  if (!fs.existsSync(skillsPath)) {
    errors.push(`Missing skills directory: ${relativePath}`);
    return;
  }

  const skillDirs = fs.readdirSync(skillsPath, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  if (skillDirs.length === 0) {
    errors.push(`No skills found in ${relativePath}`);
  }

  for (const entry of skillDirs) {
    validateSkill(path.join(skillsPath, entry.name));
  }
}

const claudeMarketplace = readJson(".claude-plugin/marketplace.json");
if (claudeMarketplace) {
  if (!claudeMarketplace.name) errors.push(".claude-plugin/marketplace.json: missing name");
  if (!claudeMarketplace.owner?.name) errors.push(".claude-plugin/marketplace.json: missing owner.name");
  if (!Array.isArray(claudeMarketplace.plugins)) {
    errors.push(".claude-plugin/marketplace.json: plugins must be an array");
  } else {
    for (const plugin of claudeMarketplace.plugins) {
      if (!plugin.name) errors.push(".claude-plugin/marketplace.json: plugin missing name");
      if (typeof plugin.source !== "string" || !plugin.source.startsWith("./")) {
        errors.push(`.claude-plugin/marketplace.json: ${plugin.name} source must be a relative ./ path`);
        continue;
      }
      const pluginPath = resolveRepoPath(plugin.source);
      if (!fs.existsSync(pluginPath)) {
        errors.push(`.claude-plugin/marketplace.json: source not found for ${plugin.name}: ${plugin.source}`);
      }
      exists(path.join(plugin.source, ".claude-plugin/plugin.json"), `Claude plugin manifest for ${plugin.name}`);
    }
  }
}

const codexMarketplace = readJson(".agents/plugins/marketplace.json");
if (codexMarketplace) {
  if (!codexMarketplace.name) errors.push(".agents/plugins/marketplace.json: missing name");
  if (!codexMarketplace.interface?.displayName) {
    errors.push(".agents/plugins/marketplace.json: missing interface.displayName");
  }
  if (!Array.isArray(codexMarketplace.plugins)) {
    errors.push(".agents/plugins/marketplace.json: plugins must be an array");
  } else {
    for (const plugin of codexMarketplace.plugins) {
      if (!plugin.name) errors.push(".agents/plugins/marketplace.json: plugin missing name");
      if (plugin.source?.source !== "local") {
        errors.push(`.agents/plugins/marketplace.json: ${plugin.name} source.source must be local`);
      }
      if (typeof plugin.source?.path !== "string" || !plugin.source.path.startsWith("./")) {
        errors.push(`.agents/plugins/marketplace.json: ${plugin.name} source.path must be a relative ./ path`);
        continue;
      }
      if (!plugin.policy?.installation) {
        errors.push(`.agents/plugins/marketplace.json: ${plugin.name} missing policy.installation`);
      }
      if (!plugin.policy?.authentication) {
        errors.push(`.agents/plugins/marketplace.json: ${plugin.name} missing policy.authentication`);
      }
      if (!plugin.category) {
        errors.push(`.agents/plugins/marketplace.json: ${plugin.name} missing category`);
      }
      exists(path.join(plugin.source.path, ".codex-plugin/plugin.json"), `Codex plugin manifest for ${plugin.name}`);
    }
  }
}

const claudePlugin = readJson("plugins/shared-skills/.claude-plugin/plugin.json");
if (claudePlugin) {
  if (!claudePlugin.name) errors.push("plugins/shared-skills/.claude-plugin/plugin.json: missing name");
  if (!claudePlugin.version) errors.push("plugins/shared-skills/.claude-plugin/plugin.json: missing version");
  if (!claudePlugin.description) errors.push("plugins/shared-skills/.claude-plugin/plugin.json: missing description");
  if (claudePlugin.skills) validateSkillsDirectory(path.join("plugins/shared-skills", claudePlugin.skills));
}

const codexPlugin = readJson("plugins/shared-skills/.codex-plugin/plugin.json");
if (codexPlugin) {
  if (!codexPlugin.name) errors.push("plugins/shared-skills/.codex-plugin/plugin.json: missing name");
  if (!codexPlugin.version) errors.push("plugins/shared-skills/.codex-plugin/plugin.json: missing version");
  if (!codexPlugin.description) errors.push("plugins/shared-skills/.codex-plugin/plugin.json: missing description");
  if (!codexPlugin.skills) {
    errors.push("plugins/shared-skills/.codex-plugin/plugin.json: missing skills path");
  } else {
    validateSkillsDirectory(path.join("plugins/shared-skills", codexPlugin.skills));
  }
}

if (errors.length > 0) {
  console.error("Marketplace validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Marketplace validation passed.");
