import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webDir = fileURLToPath(new URL("..", import.meta.url));
const stashRoot = path.join(webDir, ".build-static-stash");

await fs.rm(stashRoot, { recursive: true, force: true });
await fs.mkdir(stashRoot, { recursive: true });

const excludedPaths = [
  "src/app/api",
  "src/app/admin",
  "src/components/admin",
  "middleware.ts",
];

const movedEntries = [];

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function runCommand(command, args, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: webDir,
      stdio: "inherit",
      env: {
        ...process.env,
        ...extraEnv,
      },
    });

    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} failed with code ${code ?? "null"} and signal ${signal ?? "null"}`));
    });
  });
}

try {
  for (const relativePath of excludedPaths) {
    const sourcePath = path.join(webDir, relativePath);
    if (!(await pathExists(sourcePath))) {
      continue;
    }

    const stashPath = path.join(stashRoot, relativePath);
    await fs.mkdir(path.dirname(stashPath), { recursive: true });
    await fs.rename(sourcePath, stashPath);
    movedEntries.push({ sourcePath, stashPath });
  }

  await runCommand("npm", ["run", "db:generate"]);
  await runCommand("npx", ["next", "build"], { JP_DEPLOY_TARGET: "static" });
} finally {
  for (const entry of movedEntries.reverse()) {
    if (await pathExists(entry.stashPath)) {
      await fs.mkdir(path.dirname(entry.sourcePath), { recursive: true });
      await fs.rename(entry.stashPath, entry.sourcePath);
    }
  }

  await fs.rm(stashRoot, { recursive: true, force: true });
}