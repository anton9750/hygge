export type View = 'album' | 'dagbog' | 'spaadom'

type Props = {
  view: View
  setView: (v: View) => void
}

const ITEMS: { id: View; label: string }[] = [
  { id: 'album', label: '📷 Foto album' },
  { id: 'dagbog', label: '📔 Dagbog' },
  { id: 'spaadom', label: '🥠 Spådom' },
]

export default function Nav({ view, setView }: Props) {
  return (
    <nav className="top-nav" aria-label="Hovedmenu">
      {ITEMS.map((item) => (
        <button
          key={item.id}
          className={view === item.id ? 'nav-link active' : 'nav-link'}
          onClick={() => setView(item.id)}
          aria-current={view === item.id ? 'page' : undefined}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}
