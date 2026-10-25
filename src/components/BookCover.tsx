type Props = {
  onOpen: () => void
}

export default function BookCover({ onOpen }: Props) {
  return (
    <button className="book-cover" onClick={onOpen} aria-label="Åbn fotobogen">
      <div className="book-3d">
        <div className="book-pages-edge" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="book-spine-shadow" aria-hidden="true" />
        <div className="book-cover-face">
          <div className="book-ribbon" aria-hidden="true" />
          <div className="book-emblem" aria-hidden="true">
            ❤
          </div>
          <h2>Vores Fotobog</h2>
          <div className="book-rule" aria-hidden="true" />
          <p>Tryk her for at åbne og mindes gode stunder</p>
        </div>
      </div>
      <div className="book-floor-shadow" aria-hidden="true" />
    </button>
  )
}
