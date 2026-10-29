"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { clearSessionCookie, setSessionCookie } from "@/lib/current"
import { toForm } from "@/lib/form"
import { authenticate, register } from "@/lib/mutate"
import { clientRateKey } from "@/lib/rate-key"
import { safeNext } from "@/lib/text"
import type { FormState } from "@/lib/types"
import { createClient } from "@/utils/supabase/server"

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const result = await authenticate({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    rateKey: await clientRateKey("login"),
    now: Date.now(),
  })
  if (!result.ok || !result.userId) return toForm(result.ok ? { ok: false, code: "invalid", message: "Email or password is wrong." } : result)
  await setSessionCookie(result.userId)
  revalidatePath("/", "layout")
  redirect(safeNext(formData.get("next")))
}

export async function signupAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const result = await register({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    username: String(formData.get("username") ?? ""),
    displayName: String(formData.get("displayName") ?? ""),
    company: String(formData.get("company") ?? ""),
    rateKey: await clientRateKey("signup"),
    now: Date.now(),
  })
  if (!result.ok || !result.userId) return toForm(result)
  await setSessionCookie(result.userId)
  revalidatePath("/", "layout")
  redirect("/")
}

export async function logoutAction() {
  try {
    const supabase = createClient(await cookies())
    await supabase.auth.signOut()
  } catch {
    // Local sign-out still proceeds when Supabase is unreachable.
  }
  await clearSessionCookie()
  revalidatePath("/", "layout")
  redirect("/?notice=logged-out")
}

export async function forgotPasswordAction(): Promise<FormState> {
  return { ok: true }
}
