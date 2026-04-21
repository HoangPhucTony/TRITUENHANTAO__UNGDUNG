// Run: node scripts/dev.mjs

import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm.cmd" : "npm";
const nodeCommand = process.execPath;

const processes = [];
let shuttingDown = false;
function spawnManagedProcess(name, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell: false,
    env: process.env,
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    const unexpectedExit = signal || (code !== 0 && code !== null);
    if (unexpectedExit) {
      console.error(`[${name}] stopped unexpectedly.`);
      shutdown(code ?? 1);
      return;
    }

    shutdown(0);
  });

  processes.push(child);
  return child;
}

function killChild(child) {
  if (!child || child.killed || child.exitCode !== null) {
    return;
  }

  if (isWindows) {
    spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
      stdio: "ignore",
      shell: false,
    });
    return;
  }

  child.kill("SIGTERM");
}

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  for (const child of processes) {
    killChild(child);
  }

  process.exit(exitCode);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

if (isWindows) {
  spawnManagedProcess("backend", "cmd.exe", ["/d", "/s", "/c", "node scripts\\run-backend.mjs"], repoRoot);
  spawnManagedProcess("frontend", "cmd.exe", ["/d", "/s", "/c", "npm --prefix FE run dev"], repoRoot);
} else {
  spawnManagedProcess("backend", nodeCommand, [path.join(scriptDir, "run-backend.mjs")], repoRoot);
  spawnManagedProcess("frontend", npmCommand, ["--prefix", "FE", "run", "dev"], repoRoot);
}
