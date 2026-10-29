import { NOTICES } from "@/lib/constants"
import { safeNext } from "@/lib/text"
import type { FormState, MutationResult } from "@/lib/types"

export function toForm(result: MutationResult): FormState {
  if (result.ok) return { ok: true }
  return { error: result.message, fieldErrors: result.fieldErrors }
}

export function noticePath(path: string, code: string) {
  const safe = safeNext(path)
  const [pathname, query] = safe.split("?")
  const params = new URLSearchParams(query ?? "")
  params.set("notice", code in NOTICES ? code : "invalid")
  const search = params.toString()
  return search ? `${pathname}?${search}` : pathname
}
