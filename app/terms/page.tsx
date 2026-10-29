import { Legal } from "@/components/legal"
import Link from "next/link"

export const metadata = { title: "Terms" }

export default function Page() {
  return (
    <Legal
      title="Terms"
      lede="These terms cover use of the Crazy Fans beta. They are a starting draft, not a substitute for legal advice."
    >
      <h2>The service</h2>
      <p>
        Crazy Fans is a community for talking about Indian cinema. Features can change or pause during the beta. Core participation — reading, voting, and posting within the rules — is meant to stay available without payment.
      </p>
      <h2>Your account</h2>
      <p>
        You are responsible for the activity on your account and for keeping the password private. One person, one account. We may suspend accounts that break the <Link href="/guidelines">guidelines</Link>, manipulate votes, or create risk for other members.
      </p>
      <h2>Your posts</h2>
      <p>
        You keep ownership of what you write. You give Crazy Fans permission to display it on the site, in moderation tools, and in the ordinary operation of the community, including shareable public pages. Do not post anything you do not have the right to share. We may remove content that breaks the rules or the law.
      </p>
      <h2>No endorsement</h2>
      <p>
        Mentions of films, actors, or studios are discussion, not a partnership. Crazy Fans is not endorsed by those people or companies.
      </p>
      <h2>Acceptable use</h2>
      <p>
        You may not use the site to harass, threaten, impersonate, scrape in a way that degrades the service, or upload malware. You may not attempt to bypass a suspension, a vote limit, or an access control.
      </p>
      <h2>Liability</h2>
      <p>
        The beta is provided as available. Member posts are member posts. We do not promise that the community will be uninterrupted or that every opinion will be accurate. Nothing here limits liability that cannot legally be limited.
      </p>
    </Legal>
  )
}
