import { Legal } from "@/components/legal"

export const metadata = { title: "Guidelines" }

export default function Page() {
  return (
    <Legal
      title="Community guidelines"
      lede="Passionate disagreement is the point. Harassment is not."
    >
      <h2>Argue the work</h2>
      <p>
        Talk about films, performances, music, writing, and ideas. You can be blunt about a scene. You cannot attack a person for their identity, their body, or a private fact. That includes other members and people who work on films.
      </p>
      <h2>One member, one vote</h2>
      <p>
        Each account gets one vote in a battle. Moving that vote is allowed. Extra accounts, coordinated fake engagement, and spam replies are not. Low-effort repetition will be removed.
      </p>
      <h2>No threats, hate, or impersonation</h2>
      <ul>
        <li>No threats of violence and no encouragement of real-world harm.</li>
        <li>No slurs or attacks based on caste, religion, gender, sexuality, language, disability, or origin.</li>
        <li>No pretending to be another member, a public figure, or Crazy Fans itself.</li>
      </ul>
      <h2>Copyright</h2>
      <p>
        Do not upload film footage, official posters, studio logos, or full lyrics. Titles and short quotations used for criticism are the kind of conversation this place is for. Read the copyright page before you report or post media.
      </p>
      <h2>How moderation works</h2>
      <p>
        Use Report when a post breaks these rules. Do not pile on. Moderators can remove content, dismiss a report, or suspend an account. Suspension pauses posting and voting. It does not erase the right to read. Decisions are logged.
      </p>
      <p>
        Blocking someone hides their posts from your lists and stops them replying in your threads. It is a personal control, not a site-wide ban.
      </p>
    </Legal>
  )
}
