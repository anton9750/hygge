import FortuneCookie from './FortuneCookie'

export default function SpaadomView() {
  return (
    <div className="spaadom-view">
      <p className="spaadom-intro">Tryk på kagen for at få dagens lille hilsen.</p>
      <FortuneCookie />
    </div>
  )
}
