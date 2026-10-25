import { useState } from 'react'
import { useTheme } from './hooks/useTheme'
import ThemePicker from './components/ThemePicker'
import FireplaceButton from './components/FireplaceButton'
import Cat3D from './components/Cat3D'
import BookCover from './components/BookCover'
import Photobook from './components/Photobook'
import Nav, { type View } from './components/Nav'
import Dagbog from './components/Dagbog'
import SpaadomView from './components/SpaadomView'

const SUBTITLES: Record<View, string> = {
  album: 'Et roligt sted til at samle og se jeres kære billeder',
  dagbog: 'Dine egne ord og tanker, dag for dag',
  spaadom: 'En lille hilsen til dig, hver dag',
}

export default function App() {
  const { hue, setHue, scene, setScene } = useTheme()
  const [bookOpen, setBookOpen] = useState(false)
  const [view, setView] = useState<View>('album')

  return (
    <div className="app-scene">
      <Nav view={view} setView={setView} />

      <header className="app-header">
        <h1>Vores Hyggekrog</h1>
        <p>{SUBTITLES[view]}</p>
      </header>

      <main className="app-main">
        {view === 'album' && <BookCover onOpen={() => setBookOpen(true)} />}
        {view === 'dagbog' && <Dagbog />}
        {view === 'spaadom' && <SpaadomView />}
      </main>

      <div className="toolbar-corner">
        <FireplaceButton />
        <ThemePicker hue={hue} setHue={setHue} scene={scene} setScene={setScene} />
      </div>

      <Cat3D />

      {bookOpen && <Photobook onClose={() => setBookOpen(false)} />}
    </div>
  )
}
