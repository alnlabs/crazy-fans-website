import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { connection } from "next/server"
import { PageFallback } from "@/components/ui"
import { getCurrentUser } from "@/lib/current"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageFallback title="Moderation" />}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  )
}

async function AdminGate({ children }: { children: React.ReactNode }) {
  await connection()
  const user = await getCurrentUser()
  if (!user) redirect("/login?next=/admin/reports")
  if (user.role !== "admin" || user.status !== "active") redirect("/?notice=forbidden")
  return (
    <div className="wrap py-10">
      <p className="kicker">Moderation</p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight">Keep the room fair</h1>
      <nav className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
        <Link href="/admin/reports" className="hover:text-gold">Reports</Link>
        <Link href="/admin/content" className="hover:text-gold">Content</Link>
        <Link href="/admin/users" className="hover:text-gold">Members</Link>
        <Link href="/admin/activity" className="hover:text-gold">Activity</Link>
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  )
}
