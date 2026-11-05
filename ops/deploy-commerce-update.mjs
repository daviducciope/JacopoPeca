#!/usr/bin/env node
// Incremental runtime deployment. Preserves remote DB/admin settings and never seeds data.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
const root = path.resolve(import.meta.dirname, "..");
const require = createRequire(path.join(root, "web/package.json"));
const dotenv = require("dotenv");
const local = dotenv.parse(fs.readFileSync(path.join(root, "web/.env.local")));
const host = process.env.JP_RUNTIME_HOST || "3.69.159.183";
if (!/^[a-zA-Z0-9.-]+$/.test(host)) throw new Error("Invalid host");
const key = path.join(root, ".artifacts/jacopopeca-runtime-staging-key.pem");
const target = `ubuntu@${host}`;
const ssh = ["-i", key, "-o", "BatchMode=yes", "-o", "ConnectTimeout=15", target];
const remote = (command, capture = false) => execFileSync("ssh", [...ssh, command], { cwd: root, encoding: "utf8", stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit" });
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "jp-commerce-deploy-"));
fs.chmodSync(temp, 0o700);
try {
  const current = dotenv.parse(remote("sudo cat /opt/jacopopeca/.env.production", true));
  for (const name of ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "SENDGRID_API_KEY", "SENDGRID_FROM_EMAIL", "SENDGRID_REPLY_TO_EMAIL", "SENDGRID_MARKETING_GROUP_ID", "CRON_SECRET"]) {
    if (!local[name]) throw new Error(`Missing ${name}`);
    current[name] = local[name];
  }
  current.NEXT_PUBLIC_SITE_URL = "https://jacopopeca.com";
  const envPath = path.join(temp, ".env.production");
  fs.writeFileSync(envPath, Object.entries(current).map(([name, value]) => `${name}=${JSON.stringify(value)}`).join("\n") + "\n", { mode: 0o600 });
  remote("cd /opt/jacopopeca && (test -f .env.production.before-commerce || sudo cp .env.production .env.production.before-commerce) && sudo chmod 600 .env.production.before-commerce && (sudo docker image inspect jacopopeca-app:before-commerce-20261105 >/dev/null 2>&1 || sudo docker image tag jacopopeca-app jacopopeca-app:before-commerce-20261105) && (test -f /tmp/jacopopeca-source-before-commerce.tgz || tar -czf /tmp/jacopopeca-source-before-commerce.tgz --exclude=web/node_modules --exclude=web/.next --exclude=web/.env.local --exclude=web/out web)");
  const transport = `ssh -i ${key} -o BatchMode=yes -o ConnectTimeout=15`;
  execFileSync("rsync", ["-az", "--exclude=node_modules/", "--exclude=.next/", "--exclude=out/", "--exclude=.env*", "--exclude=*.tsbuildinfo", "--exclude=.build-static-stash/", "-e", transport, path.join(root, "web/"), `${target}:/opt/jacopopeca/web/`], { stdio: "inherit" });
  remote("mkdir -p /opt/jacopopeca/ops/systemd");
  execFileSync("rsync", ["-az", "-e", transport, path.join(root, "ops/systemd/"), `${target}:/opt/jacopopeca/ops/systemd/`], { stdio: "inherit" });
  // Build before replacing secrets or restarting the healthy container.
  remote("cd /opt/jacopopeca && sudo docker compose --env-file .env.production build app");
  execFileSync("scp", ["-i", key, "-o", "BatchMode=yes", envPath, `${target}:/opt/jacopopeca/.env.production.next`], { stdio: "inherit" });
  remote("cd /opt/jacopopeca && chmod 600 .env.production.next && mv .env.production.next .env.production && sudo docker compose --env-file .env.production up -d --no-build app");
  remote("for attempt in 1 2 3 4 5 6 7 8 9 10; do if curl -fsS http://127.0.0.1/api/shipping/; then exit 0; fi; sleep 2; done; exit 1");
  remote("sudo cp /opt/jacopopeca/ops/systemd/jacopopeca-email.service /opt/jacopopeca/ops/systemd/jacopopeca-email.timer /etc/systemd/system/ && sudo systemctl daemon-reload && sudo systemctl enable --now jacopopeca-email.timer && sudo systemctl start jacopopeca-email.service && sudo systemctl status jacopopeca-email.timer --no-pager && sudo journalctl -u jacopopeca-email.service -n 8 --no-pager");
  console.log("Commerce runtime deployed and five-minute email timer enabled.");
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
