import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import { connection } from "next/server"
import { DiscussionForm } from "@/components/forms"
import { PageFallback } from "@/components/ui"
import { getCurrentUser } from "@/lib/current"
import { getDiscussionSource } from "@/lib/present"

export const metadata = { title: "Edit discussion" }

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<PageFallback title="Edit discussion" />}>
      <EditDiscussion params={params} />
    </Suspense>
  )
}

async function EditDiscussion({ params }: { params: Promise<{ slug: string }> }) {
  await connection()
  const { slug } = await params
  const user = await getCurrentUser()
  if (!user) redirect(`/login?next=/discussions/${slug}/edit`)
  const source = await getDiscussionSource(slug, user.id)
  if (!source) notFound()
  if (source.forbidden) redirect(`/discussions/${slug}?notice=forbidden`)
  return (
    <div className="wrap max-w-3xl py-12">
      <p className="kicker">Edit</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">Revise your argument</h1>
      <div className="mt-8">
        <DiscussionForm mode="edit" slug={slug} defaults={source} />
      </div>
    </div>
  )
}
