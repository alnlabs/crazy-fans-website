"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { buttonSecondaryClass, errorClass } from "@/lib/styles"

export function GoogleButton({ next }: { next: string }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")

  async function signIn() {
    setPending(true)
    setError("")
    const supabase = createClient()
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    })
    if (authError) {
      setPending(false)
      setError("Google sign-in could not start. Confirm Google is enabled for this Supabase project.")
    }
  }

  return (
    <div className="space-y-3">
      <button type="button" className={`${buttonSecondaryClass} w-full`} onClick={signIn} disabled={pending}>
        {pending ? "Redirecting to Google…" : "Continue with Google"}
      </button>
      {error ? (
        <p role="alert" className={errorClass}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
