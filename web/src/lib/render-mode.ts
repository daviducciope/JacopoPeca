import "server-only";

import { connection } from "next/server";

export const isStaticDeployTarget = process.env.JP_DEPLOY_TARGET === "static";

export async function ensureDynamicRendering() {
  if (!isStaticDeployTarget) {
    await connection();
  }
}