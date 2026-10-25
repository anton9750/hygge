export type Photo = {
  id: string
  blob: Blob
  name: string
  createdAt: number
}

const DB_NAME = 'hygge-fotobog'
const DB_VERSION = 1
const STORE = 'photos'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function addPhoto(file: File): Promise<Photo> {
  const db = await openDb()
  const photo: Photo = {
    id: crypto.randomUUID(),
    blob: file,
    name: file.name,
    createdAt: Date.now(),
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(photo)
    tx.oncomplete = () => resolve(photo)
    tx.onerror = () => reject(tx.error)
  })
}

export async function getAllPhotos(): Promise<Photo[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => {
      const photos = (req.result as Photo[]).sort((a, b) => a.createdAt - b.createdAt)
      resolve(photos)
    }
    req.onerror = () => reject(req.error)
  })
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getStorageEstimate(): Promise<{ usedMb: number; quotaMb: number } | null> {
  if (!navigator.storage?.estimate) return null
  const { usage = 0, quota = 0 } = await navigator.storage.estimate()
  return { usedMb: usage / (1024 * 1024), quotaMb: quota / (1024 * 1024) }
}
