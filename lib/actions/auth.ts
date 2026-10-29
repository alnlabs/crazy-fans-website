"use server"

import { cookies, headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { clearSessionCookie, setSessionCookie } from "@/lib/current"
import { toForm } from "@/lib/form"
import { authenticate, register } from "@/lib/mutate"
import { clientRateKey } from "@/lib/rate-key"
import { supabaseStoreEnabled } from "@/lib/supabase/mode"
import { cleanText, safeNext, validEmail, validUsername } from "@/lib/text"
import type { FormState } from "@/lib/types"
import { createClient } from "@/utils/supabase/server"

async function origin() {
  const requestHeaders = await headers()
  return requestHeaders.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:2700"
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (supabaseStoreEnabled()) {
    const email = String(formData.get("email") ?? "").trim().toLowerCase()
    const password = String(formData.get("password") ?? "")
    const supabase = createClient(await cookies())
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: "Email or password is wrong." }
    await supabase.rpc("track_events", { event_types: ["login", "active"] })
    revalidatePath("/", "layout")
    redirect(safeNext(formData.get("next")))
  }
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
  if (supabaseStoreEnabled()) {
    if (String(formData.get("company") ?? "").trim()) return { error: "Could not create that account." }
    const email = String(formData.get("email") ?? "").trim().toLowerCase()
    const password = String(formData.get("password") ?? "")
    const username = String(formData.get("username") ?? "").trim().toLowerCase()
    const displayName = cleanText(String(formData.get("displayName") ?? "")).replaceAll("\n", " ")
    const fieldErrors: Record<string, string> = {}
    if (!validEmail(email)) fieldErrors.email = "Enter a valid email."
    if (password.length < 8) fieldErrors.password = "Use at least 8 characters."
    if (password.length > 200) fieldErrors.password = "That password is too long."
    if (!validUsername(username)) fieldErrors.username = "Use 3–20 letters, numbers, or underscores."
    if (displayName.length < 2 || displayName.length > 40) fieldErrors.displayName = "Use 2–40 characters."
    if (Object.keys(fieldErrors).length > 0) return { error: "Check the form and try again.", fieldErrors }
    const supabase = createClient(await cookies())
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: displayName },
        emailRedirectTo: `${await origin()}/auth/callback`,
      },
    })
    if (error) return { error: error.message }
    if (!data.session) return { error: "Confirm your email, then sign in." }
    revalidatePath("/", "layout")
    redirect("/")
  }
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

export async function forgotPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!supabaseStoreEnabled()) return { ok: true }
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  if (!validEmail(email)) return { error: "Enter a valid email." }
  const supabase = createClient(await cookies())
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${await origin()}/auth/callback` })
  if (error) return { error: error.message }
  return { ok: true }
}
