import { randomBytes } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { runtimeDataDir } from "@/lib/data-dir"

let memorySecret: string | null = null

export async function getAuthSecret() {
  const fromEnv = process.env.AUTH_SECRET?.trim()
  if (fromEnv && fromEnv.length >= 16) return fromEnv
  if (memorySecret) return memorySecret

  const file = path.join(runtimeDataDir(), ".auth-secret")
  try {
    const existing = (await readFile(file, "utf8")).trim()
    if (existing.length >= 16) return existing
  } catch {
    // Create one for this machine.
  }

  const secret = randomBytes(32).toString("hex")
  try {
    await mkdir(path.dirname(file), { recursive: true })
    await writeFile(file, secret, { flag: "wx" })
    return secret
  } catch {
    try {
      const existing = (await readFile(file, "utf8")).trim()
      if (existing.length >= 16) return existing
    } catch {
      memorySecret = secret
      return secret
    }
    memorySecret = secret
    return secret
  }
}
