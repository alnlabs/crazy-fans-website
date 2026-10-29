import { Suspense } from "react"
import { connection } from "next/server"
import { BattleForm } from "@/components/forms"
import { PageFallback } from "@/components/ui"
import { getCurrentUser } from "@/lib/current"
import { redirect } from "next/navigation"

export const metadata = { title: "New battle" }

export default function Page() {
  return (
    <Suspense fallback={<PageFallback title="New battle" />}>
      <NewBattle />
    </Suspense>
  )
}

async function NewBattle() {
  await connection()
  const user = await getCurrentUser()
  if (!user) redirect("/login?next=/battles/new")
  if (user.status !== "active") redirect("/battles?notice=suspended")
  return (
    <div className="wrap max-w-3xl py-12">
      <p className="kicker">Open a war</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">New battle</h1>
      <p className="mt-3 text-muted">Ask one question. Give people two to four ways to answer it. One vote each.</p>
      <div className="mt-8">
        <BattleForm />
      </div>
    </div>
  )
}
