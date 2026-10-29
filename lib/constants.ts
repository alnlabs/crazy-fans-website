import type { Category, FavoriteIndustry, Industry, ReportReason } from "@/lib/types"

export const INDUSTRIES: { id: Industry; label: string }[] = [
  { id: "all", label: "All" },
  { id: "telugu", label: "Telugu" },
  { id: "tamil", label: "Tamil" },
  { id: "hindi", label: "Hindi" },
  { id: "malayalam", label: "Malayalam" },
  { id: "kannada", label: "Kannada" },
  { id: "other", label: "Other" },
]

export const FAVORITE_INDUSTRIES: { id: FavoriteIndustry; label: string }[] = INDUSTRIES.filter(
  (item): item is { id: FavoriteIndustry; label: string } => item.id !== "all",
)

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "actors", label: "Actors" },
  { id: "movies", label: "Movies" },
  { id: "music", label: "Music" },
  { id: "directors", label: "Directors" },
  { id: "performances", label: "Performances" },
  { id: "villains", label: "Villains" },
  { id: "endings", label: "Endings" },
]

export const REPORT_REASONS: { id: ReportReason; label: string }[] = [
  { id: "harassment", label: "Harassment or a personal attack" },
  { id: "hate", label: "Hate" },
  { id: "spam", label: "Spam or fake engagement" },
  { id: "impersonation", label: "Impersonation" },
  { id: "copyright", label: "Copyright complaint" },
  { id: "other", label: "Something else" },
]

export const AVATAR_COLORS = ["#c43228", "#e2b15a", "#2f9d8a", "#d4763a", "#7d8f5a", "#3d6f8f", "#8d4d6e", "#f4efe6"]

export const NOTICES: Record<string, string> = {
  voted: "Vote recorded. Choosing another option moves it.",
  "same-vote": "That is already your vote.",
  reported: "Report received. A moderator will review it.",
  "report-limit": "You have sent enough reports for now. Try again later.",
  suspended: "Your account is suspended, so this action is paused.",
  forbidden: "You cannot do that.",
  invalid: "Check the form and try again.",
  "rate-limit": "You are moving a little fast. Try again in a few minutes.",
  removed: "Removed.",
  restored: "Restored.",
  saved: "Saved.",
  blocked: "You will not see this member in your lists.",
  unblocked: "Block removed.",
  "comment-removed": "Comment removed.",
  "discussion-removed": "Discussion removed.",
  "marked-read": "Notifications marked as read.",
  "logged-out": "You are signed out.",
  "google-failed": "Google sign-in did not finish. Try again.",
  duplicate: "You already said that.",
  closed: "This battle is closed.",
  "not-found": "That could not be found.",
}

export const LIMITS = {
  comment: { limit: 8, windowMs: 10 * 60 * 1000 },
  discussion: { limit: 5, windowMs: 24 * 60 * 60 * 1000 },
  battle: { limit: 5, windowMs: 24 * 60 * 60 * 1000 },
  reaction: { limit: 40, windowMs: 60 * 60 * 1000 },
  report: { limit: 5, windowMs: 60 * 60 * 1000 },
  vote: { limit: 30, windowMs: 60 * 60 * 1000 },
  signup: { limit: 8, windowMs: 60 * 60 * 1000 },
  login: { limit: 10, windowMs: 15 * 60 * 1000 },
} as const

export const SESSION_COOKIE = "cf_session"
export const SESSION_DAYS = 14

export function industryLabel(id: Industry) {
  return INDUSTRIES.find((item) => item.id === id)?.label ?? "All"
}

export function categoryLabel(id: Category) {
  return CATEGORIES.find((item) => item.id === id)?.label ?? id
}

export function parseIndustry(value: string | undefined): Industry {
  if (value && INDUSTRIES.some((item) => item.id === value)) return value as Industry
  return "all"
}

export function parseCategory(value: string | undefined): Category | undefined {
  if (value && CATEGORIES.some((item) => item.id === value)) return value as Category
  return undefined
}

export function parsePage(value: string | undefined) {
  const page = Number(value)
  if (!Number.isInteger(page) || page < 1) return 1
  return page
}

export function matchesIndustry(content: Industry, filter: Industry) {
  if (filter === "all") return true
  return content === filter || content === "all"
}
