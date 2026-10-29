"use client"

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="wrap py-20">
      <p className="kicker">Missed cue</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">This page did not load.</h1>
      <p className="mt-4 max-w-lg text-muted">Try it again. If it keeps failing, the Supabase tables may still need the community SQL.</p>
      <button type="button" onClick={() => reset()} className="mt-6 rounded-sm bg-crimson px-4 py-2 text-sm font-semibold text-white">
        Try again
      </button>
    </div>
  )
}
