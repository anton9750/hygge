import { useState } from 'react'
import { FORTUNES } from '../data/fortunes'
import { playCookieCrack } from '../lib/sounds'

const STORAGE_KEY = 'hygge-fortune'

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

type Stored = { date: string; index: number }

function readTodaysFortune(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const stored = JSON.parse(raw) as Stored
    if (stored.date === todayKey() && FORTUNES[stored.index]) return FORTUNES[stored.index]
  } catch {
    // ignore corrupt storage
  }
  return null
}

export default function FortuneCookie() {
  const [message, setMessage] = useState<string | null>(() => readTodaysFortune())
  const cracked = message !== null

  const crack = () => {
    if (cracked) return
    const index = Math.floor(Math.random() * FORTUNES.length)
    const stored: Stored = { date: todayKey(), index }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    playCookieCrack()
    setMessage(FORTUNES[index])
  }

  return (
    <div className="fortune-wrap">
      <button
        className={cracked ? 'fortune-cookie cracked' : 'fortune-cookie'}
        onClick={crack}
        disabled={cracked}
        aria-label={cracked ? 'Dagens lykkekage er allerede åbnet' : 'Tryk for at åbne dagens lykkekage'}
      >
        <span className="cookie-half cookie-left" />
        <span className="cookie-half cookie-right" />
        {!cracked && <span className="cookie-glow" aria-hidden="true" />}
      </button>

      <div className={cracked ? 'fortune-ribbon show' : 'fortune-ribbon'}>
        {message && <p>{message}</p>}
      </div>

      <p className="fortune-caption">
        {cracked ? 'Kom tilbage i morgen for en ny spådom 🍀' : 'Dagens lykkekage'}
      </p>
    </div>
  )
}
