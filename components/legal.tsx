export function Legal({
  title,
  lede,
  children,
}: {
  title: string
  lede: string
  children: React.ReactNode
}) {
  return (
    <article className="legal wrap max-w-3xl py-12">
      <p className="kicker">Crazy Fans</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">{title}</h1>
      <p className="mt-4 text-lg">{lede}</p>
      <p className="mt-2 text-sm text-muted">Draft for the beta · 29 October 2026. Have a lawyer review this before a public launch.</p>
      {children}
    </article>
  )
}
