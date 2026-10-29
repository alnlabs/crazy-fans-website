import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { connection } from "next/server"
import { PageFallback } from "@/components/ui"
import { getCurrentUser } from "@/lib/current"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageFallback title="Settings" />}>
      <SettingsGate>{children}</SettingsGate>
    </Suspense>
  )
}

async function SettingsGate({ children }: { children: React.ReactNode }) {
  await connection()
  const user = await getCurrentUser()
  if (!user) redirect("/login?next=/settings/profile")
  return (
    <div className="wrap max-w-3xl py-12">
      <p className="kicker">Settings</p>
      <nav className="mt-4 flex gap-4 text-sm font-semibold">
        <Link href="/settings/profile" className="hover:text-gold">Profile</Link>
        <Link href="/settings/notifications" className="hover:text-gold">Notifications</Link>
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  )
}
