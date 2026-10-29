import { Suspense } from "react"
import { requestNow } from "@/lib/time"
import { activityStats } from "@/lib/present"

export const metadata = { title: "Activity" }

export default function Page() {
  return (
    <Suspense fallback={<p className="text-muted">Loading activity…</p>}>
      <Activity />
    </Suspense>
  )
}

async function Activity() {
  const now = await requestNow()
  const stats = await activityStats(now)
  const rows = [
    ["Members", String(stats.members)],
    ["Active in 7 days", String(stats.weeklyActive)],
    ["Active in 30 days", String(stats.monthlyActive)],
    ["7-day return", percent(stats.retention7)],
    ["30-day return", percent(stats.retention30)],
    ["Activation", percent(stats.activation)],
    ["Sign-ups recorded", String(stats.signups)],
    ["Visible discussions", String(stats.discussions)],
    ["Visible replies", String(stats.comments)],
    ["Votes", String(stats.votes)],
    ["Visible battles", String(stats.battles)],
    ["Open reports", String(stats.openReports)],
  ]
  return (
    <div>
      <p className="max-w-2xl text-sm leading-6 text-muted">
        Activation is the share of members who have voted, replied, or created something. Return rates only include members old enough for that window. A blank rate means there is not enough history yet. Founding activity is included.
      </p>
      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="panel p-4">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="mt-1 font-serif text-3xl">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function percent(value: number | null) {
  if (value === null) return "Not enough history"
  return `${Math.round(value * 100)}%`
}
