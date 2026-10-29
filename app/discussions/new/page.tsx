import { redirect } from "next/navigation"
import { Suspense } from "react"
import { connection } from "next/server"
import { DiscussionForm } from "@/components/forms"
import { PageFallback } from "@/components/ui"
import { getCurrentUser } from "@/lib/current"

export const metadata = { title: "New discussion" }

export default function Page() {
  return (
    <Suspense fallback={<PageFallback title="New discussion" />}>
      <NewDiscussion />
    </Suspense>
  )
}

async function NewDiscussion() {
  await connection()
  const user = await getCurrentUser()
  if (!user) redirect("/login?next=/discussions/new")
  if (user.status !== "active") redirect("/discussions?notice=suspended")
  return (
    <div className="wrap max-w-3xl py-12">
      <p className="kicker">Start an argument</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">New discussion</h1>
      <p className="mt-3 text-muted">Make a claim someone can answer. Insults are not a claim.</p>
      <div className="mt-8">
        <DiscussionForm mode="create" />
      </div>
    </div>
  )
}
