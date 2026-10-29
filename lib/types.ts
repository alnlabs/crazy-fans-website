export type Role = "member" | "admin"
export type AccountStatus = "active" | "suspended"
export type Industry = "all" | "telugu" | "tamil" | "hindi" | "malayalam" | "kannada" | "other"
export type FavoriteIndustry = Exclude<Industry, "all">
export type Category =
  | "actors"
  | "movies"
  | "music"
  | "directors"
  | "performances"
  | "villains"
  | "endings"
export type ContentStatus = "visible" | "removed"
export type ReportTarget = "discussion" | "comment" | "battle" | "profile"
export type ReactionTarget = "discussion" | "comment" | "battle"
export type ReportStatus = "open" | "dismissed" | "actioned"
export type ReportReason = "harassment" | "hate" | "spam" | "impersonation" | "copyright" | "other"
export type EventType =
  | "signup"
  | "login"
  | "active"
  | "vote"
  | "comment"
  | "discussion"
  | "battle"
  | "reaction"
  | "report"

export type Profile = {
  id: string
  email: string
  passwordHash: string
  username: string
  displayName: string
  bio: string
  avatarColor: string
  industries: FavoriteIndustry[]
  role: Role
  status: AccountStatus
  notifyReplies: boolean
  notifyChallenges: boolean
  createdAt: string
  updatedAt: string
}

export type Discussion = {
  id: string
  authorId: string
  slug: string
  title: string
  body: string
  industry: Industry
  category: Category
  status: ContentStatus
  createdAt: string
  updatedAt: string
}

export type Comment = {
  id: string
  authorId: string
  discussionId: string | null
  battleId: string | null
  body: string
  status: ContentStatus
  createdAt: string
  updatedAt: string
}

export type Battle = {
  id: string
  authorId: string
  slug: string
  title: string
  prompt: string
  industry: Industry
  category: Category
  featured: boolean
  status: ContentStatus
  createdAt: string
  closesAt: string | null
}

export type BattleOption = {
  id: string
  battleId: string
  label: string
  position: number
}

export type Vote = {
  id: string
  battleId: string
  optionId: string
  userId: string
  createdAt: string
  updatedAt: string
}

export type Reaction = {
  id: string
  userId: string
  targetType: ReactionTarget
  targetId: string
  createdAt: string
}

export type Report = {
  id: string
  reporterId: string
  targetType: ReportTarget
  targetId: string
  reason: ReportReason
  details: string
  status: ReportStatus
  createdAt: string
  resolvedAt: string | null
}

export type ModerationAction = {
  id: string
  moderatorId: string
  reportId: string | null
  action: string
  note: string
  targetType: ReportTarget
  targetId: string
  createdAt: string
}

export type Notification = {
  id: string
  userId: string
  actorId: string
  kind: "reply"
  targetType: "discussion" | "battle"
  targetSlug: string
  excerpt: string
  read: boolean
  createdAt: string
}

export type Block = {
  id: string
  blockerId: string
  blockedId: string
  createdAt: string
}

export type AnalyticsEvent = {
  id: string
  type: EventType
  userId: string | null
  createdAt: string
}

export type RateBucket = {
  key: string
  hits: number[]
}

export type Store = {
  version: 1
  profiles: Profile[]
  discussions: Discussion[]
  comments: Comment[]
  battles: Battle[]
  battleOptions: BattleOption[]
  votes: Vote[]
  reactions: Reaction[]
  reports: Report[]
  moderationActions: ModerationAction[]
  notifications: Notification[]
  blocks: Block[]
  events: AnalyticsEvent[]
  rateBuckets: RateBucket[]
}

export type AuthorCard = {
  username: string
  displayName: string
  avatarColor: string
}

export type DiscussionCard = {
  id: string
  slug: string
  title: string
  excerpt: string
  industry: Industry
  category: Category
  createdAt: string
  author: AuthorCard
  commentCount: number
  likeCount: number
  liked: boolean
}

export type CommentCard = {
  id: string
  body: string
  createdAt: string
  author: AuthorCard
  likeCount: number
  liked: boolean
  mine: boolean
}

export type BattleOptionCard = {
  id: string
  label: string
  votes: number
  percent: number
  leading: boolean
  selected: boolean
}

export type BattleCard = {
  id: string
  slug: string
  title: string
  prompt: string
  industry: Industry
  category: Category
  createdAt: string
  featured: boolean
  closed: boolean
  author: AuthorCard
  totalVotes: number
  commentCount: number
  likeCount: number
  liked: boolean
  options: BattleOptionCard[]
}

export type MemberCard = {
  username: string
  displayName: string
  bio: string
  avatarColor: string
  industries: FavoriteIndustry[]
  createdAt: string
  discussionCount: number
  battleCount: number
  commentCount: number
  blocked: boolean
  suspended: boolean
}

export type FormState = {
  error?: string
  fieldErrors?: Record<string, string>
  ok?: boolean
}

export type MutationResult =
  | { ok: true; slug?: string; userId?: string }
  | { ok: false; code: string; message: string; fieldErrors?: Record<string, string> }
