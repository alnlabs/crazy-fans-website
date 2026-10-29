import Link from "next/link"
import { Suspense } from "react"
import { requestNow } from "@/lib/time"
import { BattleCardView } from "@/components/cards"
import { FilterBar, listHref } from "@/components/filters"
import { Notice, PageFallback, Pager } from "@/components/ui"
import { parseCategory, parseIndustry, parsePage } from "@/lib/constants"
import { getCurrentUser } from "@/lib/current"
import { getBattles } from "@/lib/present"
import { buttonClass } from "@/lib/styles"

export const metadata = { title: "Battles", description: "Fan battles and polls across Indian cinema." }

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ industry?: string; category?: string; page?: string; notice?: string }>
}) {
  return (
    <Suspense fallback={<PageFallback title="Battles" />}>
      <Battles searchParams={searchParams} />
    </Suspense>
  )
}

async function Battles({
  searchParams,
}: {
  searchParams: Promise<{ industry?: string; category?: string; page?: string; notice?: string }>
}) {
  const params = await searchParams
  const industry = parseIndustry(params.industry)
  const category = parseCategory(params.category)
  const user = await getCurrentUser()
  const now = await requestNow()
  const data = await getBattles(user?.id ?? null, industry, category, parsePage(params.page), now)
  return (
    <div className="wrap py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Wars</p>
          <h1 className="mt-3 font-serif text-5xl tracking-tight">Battles</h1>
          <p className="mt-3 max-w-xl text-muted">One vote each. Results stay visible, including before you have chosen.</p>
        </div>
        {user?.status === "active" ? (
          <Link href="/battles/new" className={buttonClass}>New battle</Link>
        ) : null}
      </div>
      <div className="mt-8">
        <Notice code={params.notice} />
        <FilterBar basePath="/battles" industry={industry} category={category} />
      </div>
      <div className="mt-8 space-y-4">
        {data.items.length === 0 ? <p className="text-muted">No battles in this corner yet.</p> : null}
        {data.items.map((item) => (
          <BattleCardView key={item.id} item={item} now={now} />
        ))}
      </div>
      <Pager page={data.page} pages={data.pages} hrefFor={(page) => listHref("/battles", industry, category, page)} />
    </div>
  )
}
