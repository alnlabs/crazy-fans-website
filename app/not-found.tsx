import Link from "next/link"

export default function NotFound() {
  return (
    <div className="wrap py-20">
      <p className="kicker">Not in this theatre</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">That page is gone.</h1>
      <p className="mt-4 text-muted">It may have been removed, or the link is wrong.</p>
      <Link href="/" className="mt-6 inline-block font-semibold text-gold">
        Back to the lobby
      </Link>
    </div>
  )
}
