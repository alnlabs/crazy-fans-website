import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { safeNext } from "@/lib/text"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = safeNext(requestUrl.searchParams.get("next"))
  const failure = new URL("/login", requestUrl.origin)
  failure.searchParams.set("notice", "google-failed")
  if (next !== "/") failure.searchParams.set("next", next)

  if (!code) return NextResponse.redirect(failure)

  const success = NextResponse.redirect(new URL(next, requestUrl.origin))
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => success.cookies.set(name, value, options))
        },
      },
    },
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) return NextResponse.redirect(failure)

  const { data } = await supabase.auth.getUser()
  if (!data.user) return NextResponse.redirect(failure)

  const meta = data.user.user_metadata ?? {}
  const requested = String(meta.username ?? "").toLowerCase()
  const username = /^[a-z0-9_]{3,20}$/.test(requested) ? requested : `fan_${data.user.id.replace(/-/g, "").slice(0, 8)}`
  const rawName = String(meta.display_name || meta.full_name || meta.name || "Fan").replace(/\s+/g, " ").trim().slice(0, 40)
  const displayName = rawName.length >= 2 ? rawName : "Fan"
  const existing = await supabase.from("profiles").select("id").eq("id", data.user.id).maybeSingle()
  if (!existing.data) {
    const inserted = await supabase.from("profiles").insert({ id: data.user.id, username, display_name: displayName })
    if (inserted.error && inserted.error.code !== "23505") return NextResponse.redirect(failure)
  }
  await supabase.rpc("track_events", { event_types: ["login", "active"] })
  return success
}
