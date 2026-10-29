import Link from "next/link"
import { Suspense } from "react"
import { ActivePing } from "@/components/active-ping"
import { Avatar } from "@/components/avatar"
import { logoutAction } from "@/lib/actions/auth"
import { getCurrentUser } from "@/lib/current"
import { unreadCount } from "@/lib/present"
import { buttonSecondaryClass } from "@/lib/styles"

const links = [
  ["/battles", "Battles"],
  ["/discussions", "Discussions"],
  ["/search", "Search"],
  ["/guidelines", "Guidelines"],
] as const

function PrimaryLinks({ className }: { className: string }) {
  return (
    <ul className={className}>
      {links.map(([href, label]) => (
        <li key={href}>
          <Link href={href} className="block py-2 text-sm font-semibold text-paper/90 hover:text-gold">
            {label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink/85 backdrop-blur-md">
      <div className="wrap flex items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="ticket-mark" aria-hidden="true" />
          <span className="font-serif text-xl tracking-tight">Crazy Fans</span>
        </Link>
        <PrimaryLinks className="hidden items-center gap-5 md:flex" />
        <div className="flex items-center gap-3">
          <details className="relative md:hidden">
            <summary className="cursor-pointer rounded-sm border border-line px-3 py-2 text-sm font-semibold">Menu</summary>
            <div className="panel absolute right-0 mt-2 w-48 p-3">
              <PrimaryLinks className="space-y-1" />
            </div>
          </details>
          <Suspense fallback={<span className="text-sm text-muted">Account</span>}>
            <AccountMenu />
          </Suspense>
        </div>
      </div>
    </header>
  )
}

async function AccountMenu() {
  const user = await getCurrentUser()
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className="px-2 py-2 text-sm font-semibold hover:text-gold">
          Sign in
        </Link>
        <Link href="/signup" className={buttonSecondaryClass}>
          Join
        </Link>
      </div>
    )
  }
  const unread = await unreadCount(user.id)
  return (
    <details className="relative">
      <summary className="flex cursor-pointer items-center gap-2 rounded-sm">
        <Avatar name={user.displayName} color={user.avatarColor} size="sm" />
        <span className="hidden text-sm font-semibold sm:inline">{user.displayName}</span>
        {unread > 0 ? (
          <span className="rounded-sm bg-crimson px-1.5 py-0.5 text-xs font-bold text-white">{unread}</span>
        ) : null}
      </summary>
      <div className="panel absolute right-0 z-40 mt-2 w-56 p-2">
        <AccountLink href={`/members/${user.username}`}>Profile</AccountLink>
        <AccountLink href="/notifications">Notifications{unread > 0 ? ` (${unread})` : ""}</AccountLink>
        <AccountLink href="/discussions/new">New discussion</AccountLink>
        <AccountLink href="/battles/new">New battle</AccountLink>
        <AccountLink href="/settings/profile">Settings</AccountLink>
        {user.role === "admin" && user.status === "active" ? <AccountLink href="/admin/reports">Moderation</AccountLink> : null}
        <form action={logoutAction}>
          <button type="submit" className="w-full px-3 py-2 text-left text-sm font-semibold text-muted hover:text-paper">
            Sign out
          </button>
        </form>
      </div>
      <ActivePing />
    </details>
  )
}

function AccountLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block rounded-sm px-3 py-2 text-sm font-semibold hover:bg-white/5">
      {children}
    </Link>
  )
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="wrap grid gap-8 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-serif text-2xl">Crazy Fans</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
            Your fandom. Your rules. Your wars. Passionate disagreement is welcome. Abuse is not.
          </p>
        </div>
        <div>
          <p className="kicker">Community</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/battles" className="hover:text-gold">Battles</Link></li>
            <li><Link href="/discussions" className="hover:text-gold">Discussions</Link></li>
            <li><Link href="/guidelines" className="hover:text-gold">Guidelines</Link></li>
          </ul>
        </div>
        <div>
          <p className="kicker">Policies</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/privacy" className="hover:text-gold">Privacy</Link></li>
            <li><Link href="/terms" className="hover:text-gold">Terms</Link></li>
            <li><Link href="/copyright" className="hover:text-gold">Copyright</Link></li>
          </ul>
        </div>
      </div>
      <p className="wrap pb-8 text-sm text-muted">
        Dream casts and the story studio come after the beta shows what people return for. Crazy Fans is not endorsed by any actor, studio, or film.
      </p>
    </footer>
  )
}
