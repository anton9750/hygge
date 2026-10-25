let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** A crisp snap for cracking open the fortune cookie. */
export function playCookieCrack() {
  const ac = getCtx()
  const now = ac.currentTime

  const duration = 0.12
  const bufferSize = Math.floor(ac.sampleRate * duration)
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    const t = i / bufferSize
    data[i] = (Math.random() * 2 - 1) * (1 - t) ** 3
  }
  const noise = ac.createBufferSource()
  noise.buffer = buffer
  const filter = ac.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 2200
  filter.Q.value = 0.8
  const noiseGain = ac.createGain()
  noiseGain.gain.value = 0.6
  noise.connect(filter)
  filter.connect(noiseGain)
  noiseGain.connect(ac.destination)
  noise.start(now)

  const osc = ac.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(180, now)
  osc.frequency.exponentialRampToValueAtTime(70, now + 0.1)
  const oscGain = ac.createGain()
  oscGain.gain.setValueAtTime(0.25, now)
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
  osc.connect(oscGain)
  oscGain.connect(ac.destination)
  osc.start(now)
  osc.stop(now + 0.16)
}

/** A soft paper "whoosh" for turning a page. */
export function playPageTurn() {
  const ac = getCtx()
  const duration = 0.45
  const bufferSize = Math.floor(ac.sampleRate * duration)
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    const t = i / bufferSize
    const envelope = Math.sin(Math.PI * t) // rise then fall
    data[i] = (Math.random() * 2 - 1) * envelope
  }
  const noise = ac.createBufferSource()
  noise.buffer = buffer
  const filter = ac.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = 900
  filter.Q.value = 0.7
  const gain = ac.createGain()
  gain.gain.value = 0.35
  noise.connect(filter)
  filter.connect(gain)
  gain.connect(ac.destination)
  noise.start()
}

/** A gentle purring "mrrau" when the cat is petted. */
export function playCatPurr() {
  const ac = getCtx()
  const now = ac.currentTime
  const osc = ac.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(220, now)
  osc.frequency.exponentialRampToValueAtTime(320, now + 0.15)
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.4)

  const vibrato = ac.createOscillator()
  vibrato.frequency.value = 24
  const vibratoGain = ac.createGain()
  vibratoGain.gain.value = 18
  vibrato.connect(vibratoGain)
  vibratoGain.connect(osc.frequency)

  const gain = ac.createGain()
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.18, now + 0.08)
  gain.gain.linearRampToValueAtTime(0, now + 0.55)

  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(now)
  vibrato.start(now)
  osc.stop(now + 0.6)
  vibrato.stop(now + 0.6)
}

/** Looping crackling fireplace ambience. Returns a stop function. */
export function startFireplace(): () => void {
  const ac = getCtx()
  const bufferSize = 2 * ac.sampleRate
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate)
  const data = buffer.getChannelData(0)
  let lastOut = 0
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1
    lastOut = (lastOut + 0.02 * white) / 1.02
    data[i] = lastOut * 6 // brown noise bed
    if (Math.random() < 0.0022) {
      data[i] += (Math.random() * 2 - 1) * 1.6 // crackle pop
    }
  }
  const noise = ac.createBufferSource()
  noise.buffer = buffer
  noise.loop = true

  const filter = ac.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 1800

  const gain = ac.createGain()
  gain.gain.setValueAtTime(0, ac.currentTime)
  gain.gain.linearRampToValueAtTime(0.5, ac.currentTime + 0.8)

  noise.connect(filter)
  filter.connect(gain)
  gain.connect(ac.destination)
  noise.start()

  return () => {
    const stopTime = ac.currentTime + 0.4
    gain.gain.linearRampToValueAtTime(0, stopTime)
    noise.stop(stopTime + 0.05)
  }
}
