import { Legal } from "@/components/legal"

export const metadata = { title: "Privacy" }

export default function Page() {
  return (
    <Legal
      title="Privacy"
      lede="We collect what the community needs to function, and we keep private data away from public pages."
    >
      <h2>What members can see</h2>
      <p>
        Your display name, username, bio, avatar colour, industries, and posts are public. Your email and password are not. Password resets, when email is connected, will not tell other people whether an address is registered.
      </p>
      <h2>What we store</h2>
      <ul>
        <li>Account details you submit: email, display name, username, bio, and a hashed password.</li>
        <li>The discussions, battles, votes, replies, reactions, reports, and blocks you create.</li>
        <li>Notification preferences and in-app reply notifications.</li>
        <li>Moderation notes and a short activity log used to understand whether people return.</li>
      </ul>
      <p>
        Rate limits may keep a short-lived, hashed network identifier. We do not put raw IP addresses in the activity log. This beta stores data in a local file on the machine running the site. A production database should live in Supabase, with row level security, and that host will have its own subprocessors.
      </p>
      <h2>Cookies</h2>
      <p>
        A signed session cookie keeps you signed in. It is httpOnly. Advertising cookies are not used. If display ads are added later, the privacy page and a consent control have to land first.
      </p>
      <h2>Your choices</h2>
      <p>
        You can edit your profile, turn reply notifications off, block members, and remove your own discussions and replies. To ask for account deletion in this beta, contact the operator running the site. Deletion should remove the account and the posts tied to it, while moderation logs may keep a minimal record of actions already taken.
      </p>
      <h2>Children</h2>
      <p>Crazy Fans is for adults. Do not create an account if you are under 18.</p>
    </Legal>
  )
}
