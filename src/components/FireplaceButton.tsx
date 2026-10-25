import { useRef, useState } from 'react'
import { startFireplace } from '../lib/sounds'

export default function FireplaceButton() {
  const [burning, setBurning] = useState(false)
  const stopRef = useRef<(() => void) | null>(null)

  const toggle = () => {
    if (burning) {
      stopRef.current?.()
      stopRef.current = null
      setBurning(false)
    } else {
      stopRef.current = startFireplace()
      setBurning(true)
    }
  }

  return (
    <button
      className={burning ? 'round-button fire-button lit' : 'round-button fire-button'}
      onClick={toggle}
      aria-pressed={burning}
      aria-label={burning ? 'Sluk pejsens knitrende lyd' : 'Tænd pejsens knitrende lyd'}
      title="Hyggelig pejs"
    >
      🔥
    </button>
  )
}
