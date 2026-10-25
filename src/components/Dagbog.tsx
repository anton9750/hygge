import { useState } from 'react'

type Entries = Record<string, string>

const STORAGE_KEY = 'hygge-dagbog'

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function readEntries(): Entries {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Entries) : {}
  } catch {
    return {}
  }
}

function formatDanish(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const text = date.toLocaleDateString('da-DK', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export default function Dagbog() {
  const today = todayKey()
  const [entries, setEntries] = useState<Entries>(() => readEntries())
  const [draft, setDraft] = useState(() => readEntries()[today] ?? '')
  const [savedPulse, setSavedPulse] = useState(false)

  const persist = (next: Entries) => {
    setEntries(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const save = () => {
    const next = { ...entries }
    if (draft.trim() === '') delete next[today]
    else next[today] = draft
    persist(next)
    setSavedPulse(true)
    window.setTimeout(() => setSavedPulse(false), 1400)
  }

  const deleteEntry = (key: string) => {
    const next = { ...entries }
    delete next[key]
    persist(next)
    if (key === today) setDraft('')
  }

  const pastDates = Object.keys(entries)
    .filter((k) => k !== today)
    .sort((a, b) => (a < b ? 1 : -1))

  return (
    <div className="dagbog">
      <section className="dagbog-today">
        <h2>I dag — {formatDanish(today)}</h2>
        <textarea
          className="dagbog-textarea"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Skriv lidt om din dag her…"
          rows={7}
        />
        <button className="cozy-button" onClick={save}>
          💾 Gem dagens linjer
        </button>
        {savedPulse && <span className="dagbog-saved">Gemt ✓</span>}
      </section>

      {pastDates.length > 0 && (
        <section className="dagbog-history">
          <h3>Tidligere dage</h3>
          <div className="dagbog-list">
            {pastDates.map((key) => (
              <article key={key} className="dagbog-entry">
                <div className="dagbog-entry-head">
                  <strong>{formatDanish(key)}</strong>
                  <button
                    className="delete-photo"
                    onClick={() => deleteEntry(key)}
                    aria-label="Slet denne dagbogsside"
                    title="Slet denne side"
                  >
                    🗑️
                  </button>
                </div>
                <p>{entries[key]}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
