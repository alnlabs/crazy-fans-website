import { matchesIndustry } from "@/lib/constants"
import { paginate } from "@/lib/format"
import { view } from "@/lib/persist"
import { excerpt } from "@/lib/text"
import type {
  AuthorCard,
  Battle,
  BattleCard,
  Category,
  CommentCard,
  Discussion,
  DiscussionCard,
  Industry,
  MemberCard,
  Profile,
  Store,
} from "@/lib/types"

const removedAuthor: AuthorCard = {
  username: "member",
  displayName: "Removed member",
  avatarColor: "#7a736a",
}

function author(store: Store, id: string): AuthorCard {
  const profile = store.profiles.find((item) => item.id === id)
  if (!profile) return removedAuthor
  return { username: profile.username, displayName: profile.displayName, avatarColor: profile.avatarColor }
}

function hidden(store: Store, viewerId: string | null, authorId: string) {
  if (!viewerId) return false
  return store.blocks.some((block) => block.blockerId === viewerId && block.blockedId === authorId)
}

function likes(store: Store, targetType: "discussion" | "comment" | "battle", targetId: string, viewerId: string | null) {
  const rows = store.reactions.filter((reaction) => reaction.targetType === targetType && reaction.targetId === targetId)
  return { likeCount: rows.length, liked: Boolean(viewerId && rows.some((reaction) => reaction.userId === viewerId)) }
}

function discussionCard(store: Store, discussion: Discussion, viewerId: string | null): DiscussionCard {
  const reaction = likes(store, "discussion", discussion.id, viewerId)
  return {
    id: discussion.id,
    slug: discussion.slug,
    title: discussion.title,
    excerpt: excerpt(discussion.body),
    industry: discussion.industry,
    category: discussion.category,
    createdAt: discussion.createdAt,
    author: author(store, discussion.authorId),
    commentCount: store.comments.filter((comment) => comment.discussionId === discussion.id && comment.status === "visible").length,
    likeCount: reaction.likeCount,
    liked: reaction.liked,
  }
}

function heat(store: Store, discussion: Discussion, now: number) {
  const comments = store.comments.filter((comment) => comment.discussionId === discussion.id && comment.status === "visible").length
  const reactions = store.reactions.filter((reaction) => reaction.targetType === "discussion" && reaction.targetId === discussion.id).length
  const ageHours = (now - new Date(discussion.createdAt).getTime()) / 36e5
  return comments * 3 + reactions * 2 - ageHours / 48
}

function visibleDiscussions(store: Store, viewerId: string | null) {
  return store.discussions.filter((discussion) => discussion.status === "visible" && !hidden(store, viewerId, discussion.authorId))
}

function battleCard(store: Store, battle: Battle, viewerId: string | null, now: number): BattleCard {
  const options = store.battleOptions
    .filter((option) => option.battleId === battle.id)
    .sort((a, b) => a.position - b.position)
  const votes = store.votes.filter((vote) => vote.battleId === battle.id)
  const mine = votes.find((vote) => vote.userId === viewerId)
  const total = votes.length
  const tallies = options.map((option) => ({
    option,
    votes: votes.filter((vote) => vote.optionId === option.id).length,
  }))
  const reaction = likes(store, "battle", battle.id, viewerId)
  const top = Math.max(0, ...tallies.map((item) => item.votes))
  const leaders = tallies.filter((item) => item.votes === top && top > 0)
  return {
    id: battle.id,
    slug: battle.slug,
    title: battle.title,
    prompt: battle.prompt,
    industry: battle.industry,
    category: battle.category,
    createdAt: battle.createdAt,
    featured: battle.featured,
    closed: Boolean(battle.closesAt && new Date(battle.closesAt).getTime() <= now),
    author: author(store, battle.authorId),
    totalVotes: total,
    commentCount: store.comments.filter((comment) => comment.battleId === battle.id && comment.status === "visible").length,
    likeCount: reaction.likeCount,
    liked: reaction.liked,
    options: tallies.map((item) => ({
      id: item.option.id,
      label: item.option.label,
      votes: item.votes,
      percent: total === 0 ? 0 : Math.round((item.votes / total) * 100),
      leading: leaders.length === 1 && item.votes === top,
      selected: mine?.optionId === item.option.id,
    })),
  }
}

function visibleBattles(store: Store, viewerId: string | null) {
  return store.battles.filter((battle) => battle.status === "visible" && !hidden(store, viewerId, battle.authorId))
}

export function getHome(viewerId: string | null, now: number) {
  return view((store) => {
    const battles = visibleBattles(store, viewerId)
      .map((battle) => battleCard(store, battle, viewerId, now))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const featured = battles.find((battle) => battle.featured) ?? battles[0] ?? null
    const discussions = visibleDiscussions(store, viewerId)
    const trending = [...discussions]
      .sort((a, b) => heat(store, b, now) - heat(store, a, now))
      .slice(0, 4)
      .map((discussion) => discussionCard(store, discussion, viewerId))
    const fresh = [...discussions]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 4)
      .map((discussion) => discussionCard(store, discussion, viewerId))
    const weeklySource = discussions.find((discussion) => discussion.slug === "the-interval-as-a-contract")
    return {
      featured,
      battles: battles.filter((battle) => battle.id !== featured?.id).slice(0, 3),
      trending,
      fresh,
      weekly: weeklySource ? discussionCard(store, weeklySource, viewerId) : null,
    }
  })
}

export function getBattles(viewerId: string | null, industry: Industry, category: Category | undefined, page: number, now: number) {
  return view((store) => {
    const filtered = visibleBattles(store, viewerId)
      .filter((battle) => matchesIndustry(battle.industry, industry) && (!category || battle.category === category))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((battle) => battleCard(store, battle, viewerId, now))
    return paginate(filtered, page)
  })
}

export function getBattle(slug: string, viewerId: string | null, now: number) {
  return view((store) => {
    const battle = store.battles.find((item) => item.slug === slug && item.status === "visible")
    if (!battle) return null
    if (hidden(store, viewerId, battle.authorId)) {
      return { blocked: true as const, username: author(store, battle.authorId).username }
    }
    const comments = commentCards(store, store.comments.filter((comment) => comment.battleId === battle.id), viewerId)
    return { blocked: false as const, battle: battleCard(store, battle, viewerId, now), comments }
  })
}

export function getDiscussions(viewerId: string | null, industry: Industry, category: Category | undefined, page: number) {
  return view((store) => {
    const filtered = visibleDiscussions(store, viewerId)
      .filter((discussion) => matchesIndustry(discussion.industry, industry) && (!category || discussion.category === category))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((discussion) => discussionCard(store, discussion, viewerId))
    return paginate(filtered, page)
  })
}

export function getDiscussion(slug: string, viewerId: string | null) {
  return view((store) => {
    const discussion = store.discussions.find((item) => item.slug === slug && item.status === "visible")
    if (!discussion) return null
    if (hidden(store, viewerId, discussion.authorId)) {
      return { blocked: true as const, username: author(store, discussion.authorId).username }
    }
    const card = discussionCard(store, discussion, viewerId)
    const comments = commentCards(store, store.comments.filter((comment) => comment.discussionId === discussion.id), viewerId)
    return {
      blocked: false as const,
      discussion: { ...card, body: discussion.body, updatedAt: discussion.updatedAt, mine: discussion.authorId === viewerId },
      comments,
    }
  })
}

export function getDiscussionSource(slug: string, viewerId: string | null) {
  return view((store) => {
    const discussion = store.discussions.find((item) => item.slug === slug && item.status === "visible")
    if (!discussion) return null
    if (discussion.authorId !== viewerId) return { forbidden: true as const }
    return {
      forbidden: false as const,
      title: discussion.title,
      body: discussion.body,
      industry: discussion.industry,
      category: discussion.category,
    }
  })
}

function commentCards(store: Store, comments: Store["comments"], viewerId: string | null): CommentCard[] {
  return comments
    .filter((comment) => comment.status === "visible" && !hidden(store, viewerId, comment.authorId))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((comment) => {
      const reaction = likes(store, "comment", comment.id, viewerId)
      return {
        id: comment.id,
        body: comment.body,
        createdAt: comment.createdAt,
        author: author(store, comment.authorId),
        likeCount: reaction.likeCount,
        liked: reaction.liked,
        mine: comment.authorId === viewerId,
      }
    })
}

export function getMember(username: string, viewerId: string | null, now: number) {
  return view((store) => {
    const profile = store.profiles.find((item) => item.username === username)
    if (!profile) return null
    const blocked = Boolean(viewerId && store.blocks.some((block) => block.blockerId === viewerId && block.blockedId === profile.id))
    const discussions = store.discussions.filter((item) => item.authorId === profile.id && item.status === "visible")
    const battles = store.battles.filter((item) => item.authorId === profile.id && item.status === "visible")
    const card: MemberCard = {
      username: profile.username,
      displayName: profile.displayName,
      bio: profile.bio,
      avatarColor: profile.avatarColor,
      industries: profile.industries,
      createdAt: profile.createdAt,
      discussionCount: discussions.length,
      battleCount: battles.length,
      commentCount: store.comments.filter((comment) => comment.authorId === profile.id && comment.status === "visible").length,
      blocked,
      suspended: profile.status === "suspended",
    }
    return {
      member: card,
      profileId: profile.id,
      discussions: blocked ? [] : discussions.map((item) => discussionCard(store, item, viewerId)),
      battles: blocked ? [] : battles.map((item) => battleCard(store, item, viewerId, now)),
      self: profile.id === viewerId,
    }
  })
}

export function searchContent(query: string, viewerId: string | null, now: number) {
  return view((store) => {
    const q = query.trim().toLowerCase().slice(0, 80)
    if (q.length < 2) return { query: q, tooShort: true, discussions: [], battles: [], members: [] }
    const discussions = visibleDiscussions(store, viewerId)
      .filter((item) => `${item.title} ${item.body}`.toLowerCase().includes(q))
      .slice(0, 10)
      .map((item) => discussionCard(store, item, viewerId))
    const battles = visibleBattles(store, viewerId)
      .filter((item) => `${item.title} ${item.prompt}`.toLowerCase().includes(q))
      .slice(0, 10)
      .map((item) => battleCard(store, item, viewerId, now))
    const members = store.profiles
      .filter((item) => !hidden(store, viewerId, item.id))
      .filter((item) => `${item.displayName} ${item.username} ${item.bio}`.toLowerCase().includes(q))
      .slice(0, 10)
      .map((item) => ({ username: item.username, displayName: item.displayName, avatarColor: item.avatarColor, bio: item.bio }))
    return { query: q, tooShort: false, discussions, battles, members }
  })
}

export function getNotifications(userId: string) {
  return view((store) =>
    store.notifications
      .filter((note) => note.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((note) => ({
        ...note,
        actor: author(store, note.actorId),
      })),
  )
}

export function unreadCount(userId: string) {
  return view((store) => store.notifications.filter((note) => note.userId === userId && !note.read).length)
}

export function getProfile(id: string) {
  return view((store) => store.profiles.find((profile) => profile.id === id) ?? null)
}

export function publicPaths() {
  return view((store) => ({
    discussions: store.discussions.filter((item) => item.status === "visible").map((item) => item.slug),
    battles: store.battles.filter((item) => item.status === "visible").map((item) => item.slug),
    members: store.profiles.map((profile) => profile.username),
  }))
}

export function getReports() {
  return view((store) =>
    store.reports
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((report) => ({
        ...report,
        reporter: author(store, report.reporterId),
        summary: targetSummary(store, report.targetType, report.targetId),
      })),
  )
}

export function getModerationQueue() {
  return view((store) => ({
    discussions: store.discussions
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((item) => ({ ...discussionCard(store, item, null), status: item.status })),
    battles: store.battles
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((item) => ({ id: item.id, slug: item.slug, title: item.title, status: item.status, author: author(store, item.authorId) })),
    comments: store.comments
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((item) => ({ id: item.id, body: excerpt(item.body, 120), status: item.status, author: author(store, item.authorId) })),
  }))
}

export function getMembersAdmin() {
  return view((store) =>
    store.profiles
      .slice()
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((profile) => ({
        id: profile.id,
        email: profile.email,
        username: profile.username,
        displayName: profile.displayName,
        role: profile.role,
        status: profile.status,
        createdAt: profile.createdAt,
        avatarColor: profile.avatarColor,
      })),
  )
}

export function activityStats(now: number) {
  return view((store) => buildActivity(store, now))
}

export function buildActivity(store: Store, now: number) {
  const day = 86400000
  const activeSince = (since: number) =>
    new Set(
      store.events
        .filter((event) => event.type === "active" && event.userId && new Date(event.createdAt).getTime() >= since)
        .map((event) => event.userId as string),
    )
  const retention = (days: number) => {
    const cutoff = now - days * day
    const people = store.profiles.filter((profile) => new Date(profile.createdAt).getTime() <= cutoff)
    if (people.length === 0) return null
    const active = activeSince(cutoff)
    return people.filter((profile) => active.has(profile.id)).length / people.length
  }
  const meaningful = new Set<string>()
  for (const vote of store.votes) meaningful.add(vote.userId)
  for (const comment of store.comments) meaningful.add(comment.authorId)
  for (const discussion of store.discussions) meaningful.add(discussion.authorId)
  for (const battle of store.battles) meaningful.add(battle.authorId)
  return {
    members: store.profiles.length,
    weeklyActive: activeSince(now - 7 * day).size,
    monthlyActive: activeSince(now - 30 * day).size,
    retention7: retention(7),
    retention30: retention(30),
    activation: store.profiles.length === 0 ? null : meaningful.size / store.profiles.length,
    discussions: store.discussions.filter((item) => item.status === "visible").length,
    comments: store.comments.filter((item) => item.status === "visible").length,
    votes: store.votes.length,
    battles: store.battles.filter((item) => item.status === "visible").length,
    openReports: store.reports.filter((report) => report.status === "open").length,
    signups: store.events.filter((event) => event.type === "signup").length,
  }
}

function targetSummary(store: Store, targetType: string, targetId: string) {
  if (targetType === "discussion") {
    const item = store.discussions.find((discussion) => discussion.id === targetId)
    return item ? item.title : "Missing discussion"
  }
  if (targetType === "battle") {
    const item = store.battles.find((battle) => battle.id === targetId)
    return item ? item.title : "Missing battle"
  }
  if (targetType === "comment") {
    const item = store.comments.find((comment) => comment.id === targetId)
    return item ? excerpt(item.body, 80) : "Missing comment"
  }
  const profile = store.profiles.find((item) => item.id === targetId)
  return profile ? profile.displayName : "Missing member"
}

export type SessionUser = Pick<
  Profile,
  | "id"
  | "email"
  | "username"
  | "displayName"
  | "bio"
  | "avatarColor"
  | "industries"
  | "role"
  | "status"
  | "notifyReplies"
  | "notifyChallenges"
>
