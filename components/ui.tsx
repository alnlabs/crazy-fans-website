import Link from "next/link"
import { NOTICES } from "@/lib/constants"

export function Notice({ code }: { code?: string }) {
  if (!code || !(code in NOTICES)) return null
  return (
    <p role="status" className="border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-paper">
      {NOTICES[code]}
    </p>
  )
}

export function PageFallback({ title, kicker = "Crazy Fans" }: { title: string; kicker?: string }) {
  return (
    <div className="wrap py-14">
      <p className="kicker">{kicker}</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">{title}</h1>
      <p className="mt-4 text-muted">Loading the room…</p>
    </div>
  )
}

export function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="panel px-5 py-8">
      <h2 className="font-serif text-2xl">{title}</h2>
      <p className="mt-2 text-muted">{body}</p>
    </div>
  )
}

export function Pager({
  page,
  pages,
  hrefFor,
}: {
  page: number
  pages: number
  hrefFor: (page: number) => string
}) {
  if (pages < 2) return null
  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-between gap-4 text-sm">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className="font-semibold hover:text-gold">
          Previous
        </Link>
      ) : (
        <span className="text-muted">Previous</span>
      )}
      <p>
        Page {page} of {pages}
      </p>
      {page < pages ? (
        <Link href={hrefFor(page + 1)} className="font-semibold hover:text-gold">
          Next
        </Link>
      ) : (
        <span className="text-muted">Next</span>
      )}
    </nav>
  )
}
