import { Legal } from "@/components/legal"

export const metadata = { title: "Copyright" }

export default function Page() {
  return (
    <Legal
      title="Copyright"
      lede="Crazy Fans hosts member writing. It does not host official film artwork or footage."
    >
      <h2>What belongs here</h2>
      <p>
        Members may discuss films by title and quote a short line when it is needed for criticism or comment. Do not post posters, trailers, stills, soundtracks, or full lyrics unless you own them or have written permission. Check the licence before you rely on a third-party image, API, or metadata source.
      </p>
      <h2>How to send a complaint</h2>
      <p>
        Use the report button and choose Copyright, or email copyright@crazyfans.local. Replace that address with a monitored inbox before a public launch. Include:
      </p>
      <ul>
        <li>Your name and a way to reach you.</li>
        <li>The work you own, or the person you represent.</li>
        <li>The exact URL of the material on Crazy Fans.</li>
        <li>A statement that you believe the use is not authorised.</li>
        <li>A statement that the notice is accurate, and your signature.</li>
      </ul>
      <h2>What happens next</h2>
      <p>
        We will review the report, remove or restrict material when the complaint is credible, and tell the member when it is appropriate. A member who believes a removal was a mistake can reply with the reason, the URL, and a statement that the material is theirs or is allowed. Repeat infringement can lead to suspension.
      </p>
      <p>
        This process is a practical beta policy. It is not a claim that any particular statute applies in every country, and a lawyer should adapt it before the site is public.
      </p>
    </Legal>
  )
}
