import { createHash } from "node:crypto"
import { headers } from "next/headers"
import { getAuthSecret } from "@/lib/secret"

export async function clientRateKey(prefix: string) {
  const headerList = await headers()
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "local"
  const secret = await getAuthSecret()
  const hash = createHash("sha256").update(`${secret}:${ip}`).digest("hex").slice(0, 20)
  return `${prefix}:${hash}`
}
