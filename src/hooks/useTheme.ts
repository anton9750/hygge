import { useCallback, useEffect, useState } from 'react'

export type Scene = 'gaard' | 'stue' | 'skrivebord' | 'terrasse' | 'strand'

export const SCENES: { id: Scene; label: string }[] = [
  { id: 'stue', label: 'Hyggelig stue' },
  { id: 'gaard', label: 'Gården' },
  { id: 'skrivebord', label: 'Skrivebordet' },
  { id: 'terrasse', label: 'Terrassen' },
  { id: 'strand', label: 'Stranden' },
]

// 20 cozy hues, spaced around the colour wheel but weighted toward warm,
// soft tones so every one of them still feels calm rather than garish.
export const HUES: number[] = [
  340, 350, 0, 10, 20, 30, 40, 50, 60, 90, 130, 160, 190, 200, 210, 230, 260, 280, 300, 320,
]

const STORAGE_KEY_HUE = 'hygge-theme-hue'
const STORAGE_KEY_SCENE = 'hygge-theme-scene'

export function useTheme() {
  const [hue, setHueState] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_HUE)
    return saved ? Number(saved) : 340 // pink & white by default
  })
  const [scene, setSceneState] = useState<Scene>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SCENE) as Scene | null
    return saved ?? 'stue'
  })

  useEffect(() => {
    document.documentElement.style.setProperty('--hue', String(hue))
  }, [hue])

  useEffect(() => {
    document.documentElement.dataset.scene = scene
  }, [scene])

  const setHue = useCallback((h: number) => {
    setHueState(h)
    localStorage.setItem(STORAGE_KEY_HUE, String(h))
  }, [])

  const setScene = useCallback((s: Scene) => {
    setSceneState(s)
    localStorage.setItem(STORAGE_KEY_SCENE, s)
  }, [])

  return { hue, setHue, scene, setScene }
}
