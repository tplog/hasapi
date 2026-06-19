#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
	existsSync,
	readFileSync,
	writeFileSync,
	copyFileSync,
	mkdirSync,
	cpSync,
	rmSync,
} from "node:fs";
import { homedir, platform } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cwd } from "node:process";

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------
// pi extensions installed via `pi install <source>`. Curate to taste.
const EXTENSIONS = [
	{ id: "markdown-preview", source: "npm:pi-markdown-preview", description: "Markdown preview" },
	{ id: "notify", source: "npm:pi-notify", description: "Desktop notifications" },
	{ id: "processes", source: "npm:@aliou/pi-processes", description: "Background process management" },
	{ id: "plannotator", source: "npm:@plannotator/pi-extension", description: "Planning and annotation workflow" },
	{ id: "mcp-adapter", source: "npm:pi-mcp-adapter", description: "MCP server integration" },
	{ id: "goal", source: "npm:@narumitw/pi-goal", description: "Goal tracking" },
	{ id: "ask-user-question", source: "npm:@juicesharp/rpiv-ask-user-question", description: "Ask-user prompts" },
	{ id: "context-mode", source: "npm:context-mode", description: "Context-mode tooling" },
	{ id: "btw", source: "npm:@narumitw/pi-btw", description: "Side-chat popover" },
	{ id: "generative-ui", source: "npm:pi-generative-ui", description: "Generative UI" },
	{ id: "glimpse", source: "npm:glimpseui", description: "Native UI widgets and dialogs" },
	{ id: "provider-kimi-code", source: "npm:pi-provider-kimi-code", description: "Kimi model provider" },
	{ id: "claude-bridge", source: "npm:pi-claude-bridge", description: "Claude Code provider bridge" },
	{ id: "chrome-devtools", source: "npm:@narumitw/pi-chrome-devtools", description: "Chrome DevTools control" },
];

// Bundled skills dir, copied as a unit into ~/.pi/agent/skills/hasapi-skills.
// The whole folder moves together so each skill's ../_shared/* paths still resolve.
const SKILLS_BUNDLE_DIR = "hasapi-skills";

const PI_CORE_SPEC = "@earendil-works/pi-coding-agent";

// ---------------------------------------------------------------------------
// Small ANSI helpers (no deps)
// ---------------------------------------------------------------------------
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : String(s));
const bold = paint("1");
const dim = paint("2");
const red = paint("31");
const green = paint("32");
const yellow = paint("33");

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const HERE = dirname(fileURLToPath(import.meta.url));
const bundledSkillsPath = () => join(HERE, "..", SKILLS_BUNDLE_DIR);
const settingsPath = () => join(homedir(), ".pi", "agent", "settings.json");
const skillsRoot = () => join(homedir(), ".pi", "agent", "skills");
const installedSkillsPath = () => join(skillsRoot(), SKILLS_BUNDLE_DIR);

// ---------------------------------------------------------------------------
// spawn / settings
// ---------------------------------------------------------------------------
function spawnCommand(command, args = [], options = {}) {
	// On Windows npm/pi resolve to .cmd shims that need a shell.
	const shell = platform() === "win32";
	return spawnSync(command, args, { shell, ...options });
}

function hasCmd(name) {
	const probe = spawnCommand(platform() === "win32" ? "where" : "which", [name], { stdio: "ignore" });
	return probe.status === 0;
}

function runPi(args) {
	return spawnCommand("pi", args, { stdio: "inherit" }).status ?? 1;
}

function readSettings() {
	const path = settingsPath();
	if (!existsSync(path)) return { path, exists: false, parsed: {}, error: null };
	try {
		return { path, exists: true, parsed: JSON.parse(readFileSync(path, "utf8")), error: null };
	} catch (err) {
		return { path, exists: true, parsed: null, error: err instanceof Error ? err.message : String(err) };
	}
}

function writeSettings(mutate) {
	const current = readSettings();
	if (current.error) return { ok: false, path: current.path, error: current.error };
	const settings = current.parsed ?? {};
	if (!mutate(settings)) return { ok: true, path: current.path, changed: false };
	mkdirSync(dirname(current.path), { recursive: true });
	if (current.exists) {
		const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
		copyFileSync(current.path, `${current.path}.hasapi.${stamp}.bak`);
	}
	writeFileSync(current.path, JSON.stringify(settings, null, 2) + "\n", "utf8");
	return { ok: true, path: current.path, changed: true };
}

function installedSources() {
	const { parsed } = readSettings();
	const set = new Set();
	for (const entry of parsed?.packages ?? []) {
		if (typeof entry === "string") set.add(entry);
		else if (entry && typeof entry.source === "string") set.add(entry.source);
	}
	return set;
}

// ---------------------------------------------------------------------------
// install steps
// ---------------------------------------------------------------------------
function ensurePi() {
	if (hasCmd("pi")) return true;
	console.log(yellow("`pi` not found on PATH."));
	console.log(`Installing Pi via \`npm install -g ${PI_CORE_SPEC}\``);
	const code = spawnCommand("npm", ["install", "-g", PI_CORE_SPEC], { stdio: "inherit" }).status;
	if (code !== 0) {
		console.error(red(`Failed to install Pi. You may need sudo:\n  sudo npm install -g ${PI_CORE_SPEC}`));
		return false;
	}
	if (!hasCmd("pi")) {
		console.error(red("Installed Pi, but `pi` is still not on PATH. Open a new shell and re-run."));
		return false;
	}
	return true;
}

function installExtensions() {
	const installed = installedSources();
	let failures = 0;
	for (const ext of EXTENSIONS) {
		if (installed.has(ext.source)) {
			console.log(dim(`  • ${ext.id} — already installed`));
			continue;
		}
		console.log(`→ pi install ${ext.source}`);
		if (runPi(["install", ext.source]) !== 0) {
			console.error(red(`  ✗ failed to install ${ext.id}`));
			failures++;
		}
	}
	return failures;
}

function installSkills() {
	const src = bundledSkillsPath();
	if (!existsSync(src)) {
		console.error(red(`Bundled skills not found at ${src}`));
		return 1;
	}
	const dest = installedSkillsPath();
	mkdirSync(skillsRoot(), { recursive: true });
	cpSync(src, dest, { recursive: true });
	console.log(green(`  ✓ skills → ${dest}`));
	return 0;
}

function enableSkillCommands() {
	const result = writeSettings((s) => {
		if (s.enableSkillCommands === true) return false;
		s.enableSkillCommands = true;
		return true;
	});
	if (!result.ok) {
		console.error(red(`Could not update settings (${result.error}). Set "enableSkillCommands": true manually.`));
		return 1;
	}
	if (result.changed) console.log(green('  ✓ enableSkillCommands: true'));
	return 0;
}

// ---------------------------------------------------------------------------
// commands
// ---------------------------------------------------------------------------
function cmdInstall() {
	console.log(bold("hasapi") + dim(" — installing onto pi\n"));
	if (!ensurePi()) return 127;

	console.log(bold("Extensions"));
	const extFailures = installExtensions();

	console.log(bold("\nSkills"));
	const skillFailures = installSkills();
	const settingsFailures = enableSkillCommands();

	const failures = extFailures + skillFailures + settingsFailures;
	console.log("");
	if (failures > 0) {
		console.error(red(`Done with ${failures} failure(s).`));
		return 1;
	}
	console.log(green("Done. Run `pi` to start."));
	return 0;
}

function cmdStatus() {
	const installed = installedSources();
	console.log(bold("Extensions"));
	for (const ext of EXTENSIONS) {
		const ok = installed.has(ext.source);
		console.log(`  ${ok ? green("✓") : yellow("•")} ${ext.id} ${dim(ext.source)}`);
	}
	console.log(bold("\nSkills"));
	const skillsOk = existsSync(installedSkillsPath());
	console.log(`  ${skillsOk ? green("✓") : yellow("•")} ${SKILLS_BUNDLE_DIR} ${dim(installedSkillsPath())}`);
	const { parsed } = readSettings();
	const cmdsOn = parsed?.enableSkillCommands === true;
	console.log(`  ${cmdsOn ? green("✓") : yellow("•")} enableSkillCommands`);
	return 0;
}

function cmdRemove() {
	let failures = 0;
	const installed = installedSources();
	console.log(bold("Removing extensions"));
	for (const ext of EXTENSIONS) {
		if (!installed.has(ext.source)) {
			console.log(dim(`  • ${ext.id} — not installed`));
			continue;
		}
		console.log(`→ pi remove ${ext.source}`);
		if (runPi(["remove", ext.source]) !== 0) {
			console.error(red(`  ✗ failed to remove ${ext.id}`));
			failures++;
		}
	}
	console.log(bold("\nRemoving skills"));
	const dest = installedSkillsPath();
	if (existsSync(dest)) {
		rmSync(dest, { recursive: true, force: true });
		console.log(green(`  ✓ removed ${dest}`));
	} else {
		console.log(dim(`  • skills not present`));
	}
	return failures > 0 ? 1 : 0;
}

function cmdDoctor() {
	const checks = [];
	const [major] = process.versions.node.split(".").map(Number);
	checks.push([major >= 20, `Node ${process.versions.node} (need >=20)`]);
	checks.push([hasCmd("pi"), "`pi` on PATH"]);
	const s = readSettings();
	checks.push([!s.error, s.error ? `settings.json invalid JSON (${s.error})` : `settings.json readable`]);
	checks.push([existsSync(bundledSkillsPath()), `bundled skills present`]);
	let ok = true;
	for (const [pass, label] of checks) {
		console.log(`  ${pass ? green("✓") : red("✗")} ${label}`);
		if (!pass) ok = false;
	}
	return ok ? 0 : 1;
}

function cmdHelp() {
	console.log(`${bold("hasapi")} — install hasapi extensions + skills onto pi

Usage:
  npx @tplog/hasapi            Install everything (extensions + skills)
  npx @tplog/hasapi status     Show what's installed
  npx @tplog/hasapi remove     Remove hasapi extensions + skills
  npx @tplog/hasapi doctor     Check environment
  npx @tplog/hasapi help       Show this help`);
	return 0;
}

// ---------------------------------------------------------------------------
// entry
// ---------------------------------------------------------------------------
const command = process.argv[2] ?? "install";
const dispatch = {
	install: cmdInstall,
	status: cmdStatus,
	remove: cmdRemove,
	doctor: cmdDoctor,
	help: cmdHelp,
	"--help": cmdHelp,
	"-h": cmdHelp,
};
const handler = dispatch[command];
if (!handler) {
	console.error(red(`Unknown command: ${command}`));
	cmdHelp();
	process.exit(2);
}
process.exit(handler());
