import Link from "next/link"
import { Suspense } from "react"
import { connection } from "next/server"
import { LoginForm } from "@/components/forms"
import { GoogleButton } from "@/components/google-button"
import { Notice, PageFallback } from "@/components/ui"
import { getCurrentUser } from "@/lib/current"
import { safeNext } from "@/lib/text"
import { redirect } from "next/navigation"

export const metadata = { title: "Sign in" }

export default function Page({ searchParams }: { searchParams: Promise<{ next?: string; notice?: string }> }) {
  return (
    <Suspense fallback={<PageFallback title="Sign in" />}>
      <Login searchParams={searchParams} />
    </Suspense>
  )
}

async function Login({ searchParams }: { searchParams: Promise<{ next?: string; notice?: string }> }) {
  await connection()
  const user = await getCurrentUser()
  const params = await searchParams
  const next = safeNext(params.next)
  if (user) redirect(next)
  return (
    <div className="wrap max-w-md py-16">
      <p className="kicker">Welcome back</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">Sign in</h1>
      <div className="mt-8 space-y-6">
        <Notice code={params.notice} />
        <GoogleButton next={next} />
        <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted">or email</p>
        <LoginForm next={next} />
      </div>
      <p className="mt-6 text-sm text-muted">
        <Link href="/forgot-password" className="hover:text-gold">Forgot password</Link>
        {" · "}
        <Link href="/signup" className="hover:text-gold">Create an account</Link>
      </p>
    </div>
  )
}
