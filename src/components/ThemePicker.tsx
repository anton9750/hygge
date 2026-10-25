import { useState } from 'react'
import { HUES, SCENES, type Scene } from '../hooks/useTheme'

type Props = {
  hue: number
  setHue: (h: number) => void
  scene: Scene
  setScene: (s: Scene) => void
}

export default function ThemePicker({ hue, setHue, scene, setScene }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="theme-picker">
      <button
        className="round-button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Skift farver og baggrund"
      >
        🎨
      </button>
      {open && (
        <div className="theme-panel" role="dialog" aria-label="Vælg udseende">
          <h2>Vælg en farve</h2>
          <div className="hue-grid">
            {HUES.map((h) => (
              <button
                key={h}
                className={h === hue ? 'hue-swatch active' : 'hue-swatch'}
                style={{ background: `hsl(${h}, 55%, 72%)` }}
                aria-label={`Farvenuance ${h}`}
                onClick={() => setHue(h)}
              />
            ))}
          </div>

          <h2>Vælg en baggrund</h2>
          <div className="scene-grid">
            {SCENES.map((s) => (
              <button
                key={s.id}
                className={s.id === scene ? 'scene-button active' : 'scene-button'}
                onClick={() => setScene(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button className="cozy-button small" onClick={() => setOpen(false)}>
            Luk
          </button>
        </div>
      )}
    </div>
  )
}
