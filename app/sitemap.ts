import type { MetadataRoute } from "next"
import { publicPaths } from "@/lib/present"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:2700"
  const paths = await publicPaths()
  const staticRoutes = ["", "/battles", "/discussions", "/search", "/guidelines", "/privacy", "/terms", "/copyright"]
  return [
    ...staticRoutes.map((path) => ({ url: `${base}${path || "/"}` })),
    ...paths.discussions.map((slug) => ({ url: `${base}/discussions/${slug}` })),
    ...paths.battles.map((slug) => ({ url: `${base}/battles/${slug}` })),
    ...paths.members.map((username) => ({ url: `${base}/members/${username}` })),
  ]
}
