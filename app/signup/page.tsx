import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { connection } from "next/server"
import { SignupForm } from "@/components/forms"
import { GoogleButton } from "@/components/google-button"
import { PageFallback } from "@/components/ui"
import { getCurrentUser } from "@/lib/current"

export const metadata = { title: "Join" }

export default function Page() {
  return (
    <Suspense fallback={<PageFallback title="Join" />}>
      <Join />
    </Suspense>
  )
}

async function Join() {
  await connection()
  const user = await getCurrentUser()
  if (user) redirect("/")
  return (
    <div className="wrap max-w-md py-16">
      <p className="kicker">New member</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">Join the room</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        By creating an account you agree to the <Link href="/guidelines" className="text-gold">guidelines</Link>,{" "}
        <Link href="/terms" className="text-gold">terms</Link>, and <Link href="/privacy" className="text-gold">privacy policy</Link>.
      </p>
      <div className="mt-8 space-y-6">
        <GoogleButton next="/" />
        <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted">or email</p>
        <SignupForm />
      </div>
      <p className="mt-6 text-sm text-muted">
        Already a member? <Link href="/login" className="text-gold">Sign in</Link>
      </p>
    </div>
  )
}
