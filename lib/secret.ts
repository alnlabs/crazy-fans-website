import { randomBytes } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

export async function getAuthSecret() {
  const fromEnv = process.env.AUTH_SECRET?.trim()
  if (fromEnv && fromEnv.length >= 16) return fromEnv

  const file = path.join(process.cwd(), "data", ".auth-secret")
  try {
    const existing = (await readFile(file, "utf8")).trim()
    if (existing.length >= 16) return existing
  } catch {
    // Create one for this machine.
  }

  await mkdir(path.dirname(file), { recursive: true })
  const secret = randomBytes(32).toString("hex")
  try {
    await writeFile(file, secret, { flag: "wx" })
    return secret
  } catch {
    return (await readFile(file, "utf8")).trim()
  }
}
