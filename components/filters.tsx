import Link from "next/link"
import { CATEGORIES, INDUSTRIES, categoryLabel } from "@/lib/constants"
import type { Category, Industry } from "@/lib/types"

function hrefFor(base: string, industry: Industry, category?: Category) {
  const params = new URLSearchParams()
  if (industry !== "all") params.set("industry", industry)
  if (category) params.set("category", category)
  const query = params.toString()
  return query ? `${base}?${query}` : base
}

export function FilterBar({
  basePath,
  industry,
  category,
}: {
  basePath: string
  industry: Industry
  category?: Category
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" aria-label="Film industry">
        {INDUSTRIES.map((item) => {
          const active = industry === item.id
          return (
            <Link
              key={item.id}
              href={hrefFor(basePath, item.id, category)}
              aria-current={active ? "page" : undefined}
              className={`rounded-sm border px-3 py-1.5 text-sm font-semibold ${active ? "border-gold bg-gold text-ink" : "border-line text-paper hover:border-gold"}`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Topic">
        <Link
          href={hrefFor(basePath, industry)}
          aria-current={category ? undefined : "page"}
          className={`rounded-sm px-3 py-1 text-sm ${category ? "text-muted hover:text-paper" : "font-semibold text-gold"}`}
        >
          Any topic
        </Link>
        {CATEGORIES.map((item) => {
          const active = category === item.id
          return (
            <Link
              key={item.id}
              href={hrefFor(basePath, industry, item.id)}
              aria-current={active ? "page" : undefined}
              className={`rounded-sm px-3 py-1 text-sm ${active ? "font-semibold text-gold" : "text-muted hover:text-paper"}`}
            >
              {categoryLabel(item.id)}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function listHref(base: string, industry: Industry, category: Category | undefined, page: number) {
  const params = new URLSearchParams()
  if (industry !== "all") params.set("industry", industry)
  if (category) params.set("category", category)
  if (page > 1) params.set("page", String(page))
  const query = params.toString()
  return query ? `${base}?${query}` : base
}
