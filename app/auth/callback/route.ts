import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { SESSION_COOKIE, SESSION_DAYS } from "@/lib/constants"
import { signInWithGoogle } from "@/lib/mutate"
import { getAuthSecret } from "@/lib/secret"
import { signSession } from "@/lib/session"
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
  const email = data.user?.email
  if (!email) return NextResponse.redirect(failure)

  const metadata = data.user?.user_metadata ?? {}
  const displayName = String(metadata.full_name || metadata.name || "")
  const result = await signInWithGoogle({ email, displayName, now: Date.now() })
  if (!result.ok || !result.userId) return NextResponse.redirect(failure)

  const secret = await getAuthSecret()
  success.cookies.set(SESSION_COOKIE, signSession(result.userId, secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  })
  return success
}
