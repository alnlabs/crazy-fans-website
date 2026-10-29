import Link from "next/link"
import { Suspense } from "react"
import { requestNow } from "@/lib/time"
import { DiscussionCardView } from "@/components/cards"
import { FilterBar, listHref } from "@/components/filters"
import { Notice, PageFallback, Pager } from "@/components/ui"
import { parseCategory, parseIndustry, parsePage } from "@/lib/constants"
import { getCurrentUser } from "@/lib/current"
import { getDiscussions } from "@/lib/present"
import { buttonClass } from "@/lib/styles"

export const metadata = { title: "Discussions", description: "Community arguments about Indian cinema." }

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ industry?: string; category?: string; page?: string; notice?: string }>
}) {
  return (
    <Suspense fallback={<PageFallback title="Discussions" />}>
      <Discussions searchParams={searchParams} />
    </Suspense>
  )
}

async function Discussions({
  searchParams,
}: {
  searchParams: Promise<{ industry?: string; category?: string; page?: string; notice?: string }>
}) {
  const params = await searchParams
  const industry = parseIndustry(params.industry)
  const category = parseCategory(params.category)
  const user = await getCurrentUser()
  const now = await requestNow()
  const data = await getDiscussions(user?.id ?? null, industry, category, parsePage(params.page))
  return (
    <div className="wrap py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">The room</p>
          <h1 className="mt-3 font-serif text-5xl tracking-tight">Discussions</h1>
          <p className="mt-3 max-w-xl text-muted">Argue the film. Leave the person alone.</p>
        </div>
        {user?.status === "active" ? (
          <Link href="/discussions/new" className={buttonClass}>New discussion</Link>
        ) : null}
      </div>
      <div className="mt-8 space-y-6">
        <Notice code={params.notice} />
        <FilterBar basePath="/discussions" industry={industry} category={category} />
        {data.items.length === 0 ? <p className="text-muted">Nothing in this filter yet.</p> : null}
        {data.items.map((item) => (
          <DiscussionCardView key={item.id} item={item} now={now} />
        ))}
      </div>
      <Pager page={data.page} pages={data.pages} hrefFor={(page) => listHref("/discussions", industry, category, page)} />
    </div>
  )
}
