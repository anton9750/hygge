import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { addPhoto, deletePhoto, getAllPhotos, getStorageEstimate, type Photo } from '../lib/db'
import { playPageTurn } from '../lib/sounds'

type Layout = 1 | 4 | 9

const LAYOUT_KEY = 'hygge-photobook-layout'

type Props = {
  onClose: () => void
}

function chunk<T>(items: T[], size: number): T[][] {
  if (items.length === 0) return [[]]
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

export default function Photobook({ onClose }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [layout, setLayout] = useState<Layout>(() => {
    const saved = localStorage.getItem(LAYOUT_KEY)
    return (saved ? Number(saved) : 4) as Layout
  })
  const [pageIndex, setPageIndex] = useState(0)
  const [flip, setFlip] = useState<'next' | 'prev' | null>(null)
  const [flipSnapshot, setFlipSnapshot] = useState<Photo[]>([])
  const [storage, setStorage] = useState<{ usedMb: number; quotaMb: number } | null>(null)
  const [landingMap, setLandingMap] = useState<Map<string, number>>(new Map())
  const [overview, setOverview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const LAND_STAGGER = 0.35 // seconds between each photo's slow landing
  const LAND_DURATION = 1.1 // seconds, matches the photo-land keyframes

  const reload = useCallback(async () => {
    const all = await getAllPhotos()
    setPhotos(all)
    getStorageEstimate().then(setStorage)
    return all
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  useEffect(() => {
    setUrls((prev) => {
      const next: Record<string, string> = {}
      for (const p of photos) {
        next[p.id] = prev[p.id] ?? URL.createObjectURL(p.blob)
      }
      for (const id of Object.keys(prev)) {
        if (!next[id]) URL.revokeObjectURL(prev[id])
      }
      return next
    })
  }, [photos])

  useEffect(() => {
    return () => {
      Object.values(urls).forEach((u) => URL.revokeObjectURL(u))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pages = useMemo(() => chunk(photos, layout), [photos, layout])

  useEffect(() => {
    if (pageIndex > pages.length - 1) setPageIndex(Math.max(0, pages.length - 1))
  }, [pages.length, pageIndex])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (overview) setOverview(false)
        else onClose()
      }
      if (!overview && e.key === 'ArrowRight') turnPage('next')
      if (!overview && e.key === 'ArrowLeft') turnPage('prev')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pages.length, overview])

  const turnPage = (direction: 'next' | 'prev') => {
    if (flip) return
    const target = direction === 'next' ? pageIndex + 1 : pageIndex - 1
    if (target < 0 || target > pages.length - 1) return
    playPageTurn()
    setFlipSnapshot(currentPage)
    setFlip(direction)
    setPageIndex(target)
    window.setTimeout(() => {
      setFlip(null)
    }, 500)
  }

  const onUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const added: Photo[] = []
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      added.push(await addPhoto(file))
    }
    const all = await reload()
    const newPageCount = Math.max(1, Math.ceil(all.length / layout))
    setPageIndex(newPageCount - 1)
    if (fileInputRef.current) fileInputRef.current.value = ''

    if (added.length > 0) {
      setLandingMap(new Map(added.map((p, i) => [p.id, i])))
      const totalMs = (added.length * LAND_STAGGER + LAND_DURATION) * 1000
      window.setTimeout(() => setLandingMap(new Map()), totalMs)
    }
  }

  const onDelete = async (id: string) => {
    await deletePhoto(id)
    await reload()
  }

  const currentPage = pages[pageIndex] ?? []
  const layoutClass = `grid-${layout}`

  const renderPage = (items: Photo[]) => (
    <div className={`photobook-grid ${layoutClass}`}>
      {items.map((p) => {
        const landIndex = landingMap.get(p.id)
        return (
          <figure
            key={p.id}
            className={landIndex !== undefined ? 'photo-tile landing' : 'photo-tile'}
            style={landIndex !== undefined ? { animationDelay: `${landIndex * LAND_STAGGER}s` } : undefined}
          >
            <img src={urls[p.id]} alt="Minde fra fotoalbummet" />
            <button
              className="delete-photo"
              onClick={() => onDelete(p.id)}
              aria-label="Slet dette billede"
              title="Slet billede"
            >
              🗑️
            </button>
          </figure>
        )
      })}
      {items.length === 0 && (
        <div className="empty-page">
          <p>Siden er tom endnu.</p>
          <p>Tryk på “Tilføj billeder” for at fylde fotobogen med minder. 📷</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="photobook-overlay" role="dialog" aria-modal="true" aria-label="Fotobog">
      <div className="photobook-toolbar">
        <div className="layout-switch" role="group" aria-label="Billeder pr. side">
          {([1, 4, 9] as Layout[]).map((n) => (
            <button
              key={n}
              className={layout === n ? 'cozy-button small active' : 'cozy-button small'}
              onClick={() => {
                localStorage.setItem(LAYOUT_KEY, String(n))
                setLayout(n)
                setPageIndex(0)
              }}
            >
              {n === 1 ? '1 billede' : n === 4 ? '2 × 2' : '3 × 3'}
            </button>
          ))}
        </div>

        <label className="cozy-button small upload-label">
          ➕ Tilføj billeder
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => void onUpload(e.target.files)}
            hidden
          />
        </label>

        <button
          className={overview ? 'cozy-button small active' : 'cozy-button small'}
          onClick={() => setOverview((o) => !o)}
          aria-pressed={overview}
        >
          🗂️ Overblik
        </button>

        <button className="cozy-button small" onClick={onClose}>
          ✕ Luk bogen
        </button>
      </div>

      {overview ? (
        <div className="overview-panel" aria-label="Overblik over alle billeder">
          {photos.length === 0 ? (
            <p className="overview-empty">Der er endnu ingen billeder i fotobogen.</p>
          ) : (
            <div className="overview-grid">
              {photos.map((p, idx) => (
                <figure key={p.id} className="overview-tile">
                  <button
                    className="overview-thumb"
                    onClick={() => {
                      setPageIndex(Math.floor(idx / layout))
                      setOverview(false)
                    }}
                    aria-label="Gå til dette billede i bogen"
                    title="Gå til denne side"
                  >
                    <img src={urls[p.id]} alt="Minde fra fotoalbummet" />
                  </button>
                  <button
                    className="delete-photo"
                    onClick={() => onDelete(p.id)}
                    aria-label="Slet dette billede"
                    title="Slet billede"
                  >
                    🗑️
                  </button>
                </figure>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="book">
          <button
            className="page-arrow left"
            onClick={() => turnPage('prev')}
            disabled={pageIndex === 0}
            aria-label="Forrige side"
          >
            ‹
          </button>

          <div className="page-stage">
            <div className="page current">{renderPage(currentPage)}</div>
            {flip && <div className={`page flipping flip-${flip}`}>{renderPage(flipSnapshot)}</div>}
          </div>

          <button
            className="page-arrow right"
            onClick={() => turnPage('next')}
            disabled={pageIndex >= pages.length - 1}
            aria-label="Næste side"
          >
            ›
          </button>
        </div>
      )}

      <div className="photobook-footer">
        {overview ? (
          <span>
            {photos.length} {photos.length === 1 ? 'billede' : 'billeder'} i alt
          </span>
        ) : (
          <span>
            Side {pages.length === 0 ? 0 : pageIndex + 1} af {pages.length}
          </span>
        )}
        {storage && (
          <span>
            Bruger {storage.usedMb.toFixed(0)} MB af ca. {storage.quotaMb.toFixed(0)} MB plads i browseren
          </span>
        )}
      </div>
    </div>
  )
}
