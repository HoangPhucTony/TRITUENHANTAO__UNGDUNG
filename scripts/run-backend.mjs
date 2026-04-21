import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const backendDir = path.join(repoRoot, "BE");
const isWindows = process.platform === "win32";

function getWindowsPythonPathCandidates() {
  const result = spawnSync("cmd.exe", ["/d", "/s", "/c", "where python"], {
    cwd: backendDir,
    stdio: ["ignore", "pipe", "ignore"],
    encoding: "utf8",
    shell: false,
  });

  if (result.error || result.status !== 0 || !result.stdout) {
    return [];
  }

  return result.stdout
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((command) => ({ command, prefixArgs: [] }));
}

function resolvePythonCommand() {
  const candidates = isWindows
    ? [
        ...getWindowsPythonPathCandidates(),
        { command: "python", versionArgs: ["--version"], prefixArgs: [] },
        { command: "py", versionArgs: ["-3.13", "--version"], prefixArgs: ["-3.13"] },
        { command: "py", versionArgs: ["-3", "--version"], prefixArgs: ["-3"] },
        { command: "py", versionArgs: ["--version"], prefixArgs: [] },
      ]
    : [
        { command: "python3", versionArgs: ["--version"], prefixArgs: [] },
        { command: "python", versionArgs: ["--version"], prefixArgs: [] },
      ];

  for (const candidate of candidates) {
    const result = spawnSync(candidate.command, [...candidate.prefixArgs, "-c", "import uvicorn"], {
      cwd: backendDir,
      stdio: "ignore",
      shell: false,
    });

    if (!result.error && result.status === 0) {
      return candidate;
    }
  }

  throw new Error(
    "No Python interpreter with uvicorn installed was found. Run `python -m pip install -r BE/requirements.txt` or activate the correct virtual environment first.",
  );
}

let python;

try {
  python = resolvePythonCommand();
} catch (error) {
  console.error(error instanceof Error ? error.message : "Python was not found in PATH.");
  process.exit(1);
}

const args = [...python.prefixArgs, "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"];

const child = spawn(python.command, args, {
  cwd: backendDir,
  stdio: "inherit",
  shell: false,
  env: {
    ...process.env,
    PYTHONIOENCODING: "utf-8",
  },
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
