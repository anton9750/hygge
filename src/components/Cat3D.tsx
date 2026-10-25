import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { playCatPurr } from '../lib/sounds'

type Heart = { id: number; x: number }

function makeTailCurve(): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.05, 0.42, -0.25),
    new THREE.Vector3(0.18, 0.85, -0.65),
    new THREE.Vector3(0.3, 1.15, -1.15),
    new THREE.Vector3(0.18, 1.3, -1.6),
  ])
}

/** A detailed 3D cat napping in the corner of the screen. Click/tap it to pet it. */
export default function Cat3D() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [hearts, setHearts] = useState<Heart[]>([])
  const [petting, setPetting] = useState(false)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const size = 200
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
    camera.position.set(0.3, 2.0, 5.4)
    camera.lookAt(0, 0.6, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(size, size)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    // ---- lighting: warm key light, cool-ish fill, soft hemisphere ----
    scene.add(new THREE.HemisphereLight(0xfff3e6, 0x6b4a36, 1.0))
    const key = new THREE.DirectionalLight(0xffe4bf, 1.15)
    key.position.set(2.4, 4, 3.2)
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xbcd6ff, 0.35)
    fill.position.set(-3, 1.5, -2)
    scene.add(fill)
    const rim = new THREE.PointLight(0xffd9a0, 0.6, 8)
    rim.position.set(-1, 1.8, -2.5)
    scene.add(rim)

    // ---- materials ----
    const furMain = new THREE.MeshStandardMaterial({
      color: new THREE.Color('hsl(26, 58%, 56%)'),
      roughness: 0.75,
      metalness: 0.02,
    })
    const furDark = new THREE.MeshStandardMaterial({
      color: new THREE.Color('hsl(22, 42%, 34%)'),
      roughness: 0.8,
    })
    const furCream = new THREE.MeshStandardMaterial({
      color: new THREE.Color('hsl(36, 65%, 90%)'),
      roughness: 0.7,
    })
    const innerEarMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('hsl(348, 58%, 80%)'),
      roughness: 0.6,
    })
    const noseMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('hsl(350, 65%, 68%)'),
      roughness: 0.4,
    })
    const irisMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('hsl(126, 45%, 32%)'),
      roughness: 0.3,
    })
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x15110d, roughness: 0.2 })
    const highlightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    })
    const whiskerMat = new THREE.MeshStandardMaterial({ color: 0xfff6e8, roughness: 0.4 })

    const cat = new THREE.Group()

    // ---- body ----
    const body = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), furMain)
    body.scale.set(1.08, 0.82, 1.38)
    body.position.set(0, -0.02, -0.05)
    cat.add(body)

    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.62, 20, 16), furCream)
    chest.scale.set(0.85, 1.05, 0.7)
    chest.position.set(0, -0.08, 0.75)
    cat.add(chest)

    // subtle tabby stripes on the back
    const stripeGeo = new THREE.SphereGeometry(0.5, 12, 8)
    const stripePositions: [number, number, number, number][] = [
      [0, 0.52, -0.6, 0.2],
      [0.18, 0.5, -0.15, 0.16],
      [-0.18, 0.5, -0.15, 0.16],
    ]
    for (const [x, y, z, s] of stripePositions) {
      const stripe = new THREE.Mesh(stripeGeo, furDark)
      stripe.position.set(x, y, z)
      stripe.scale.set(s, s * 0.35, s * 0.9)
      cat.add(stripe)
    }

    // ---- head group (so face parts move together) ----
    const headGroup = new THREE.Group()
    headGroup.position.set(0, 0.58, 1.08)
    cat.add(headGroup)

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.68, 28, 20), furMain)
    head.scale.set(1, 0.95, 0.95)
    headGroup.add(head)

    const cheekGeo = new THREE.SphereGeometry(0.26, 16, 12)
    const cheekL = new THREE.Mesh(cheekGeo, furCream)
    cheekL.position.set(-0.26, -0.18, 0.52)
    cheekL.scale.set(1, 0.8, 0.9)
    const cheekR = cheekL.clone()
    cheekR.position.x = 0.26
    headGroup.add(cheekL, cheekR)

    const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), furCream)
    muzzle.position.set(0, -0.3, 0.6)
    muzzle.scale.set(1.1, 0.7, 0.8)
    headGroup.add(muzzle)

    // ears: outer cone + inner pink cone, slightly forward-tilted
    const earOuterGeo = new THREE.ConeGeometry(0.27, 0.46, 4)
    const earInnerGeo = new THREE.ConeGeometry(0.15, 0.3, 4)
    function makeEar(side: number) {
      const group = new THREE.Group()
      const outer = new THREE.Mesh(earOuterGeo, furMain)
      outer.rotation.z = side * 0.08
      outer.rotation.y = Math.PI / 4
      const inner = new THREE.Mesh(earInnerGeo, innerEarMat)
      inner.position.set(0, -0.02, 0.09)
      inner.rotation.copy(outer.rotation)
      group.add(outer, inner)
      group.position.set(side * 0.37, 0.58, -0.05)
      group.rotation.z = side * 0.15
      return group
    }
    const earL = makeEar(-1)
    const earR = makeEar(1)
    headGroup.add(earL, earR)

    // eyes: iris + pupil + highlight, grouped so they can "squint" together
    function makeEye(side: number) {
      const group = new THREE.Group()
      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 12), irisMat)
      iris.scale.set(1, 1.15, 0.6)
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), pupilMat)
      pupil.scale.set(1, 1.3, 0.5)
      pupil.position.z = 0.04
      const highlight = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), highlightMat)
      highlight.position.set(-0.025, 0.03, 0.07)
      group.add(iris, pupil, highlight)
      group.position.set(side * 0.28, 0.02, 0.6)
      return group
    }
    const eyeL = makeEye(-1)
    const eyeR = makeEye(1)
    headGroup.add(eyeL, eyeR)

    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.07, 3), noseMat)
    nose.position.set(0, -0.22, 0.78)
    nose.rotation.x = Math.PI / 1.15
    nose.rotation.z = Math.PI / 6
    headGroup.add(nose)

    // whiskers: thin cylinders fanning from the muzzle
    const whiskerGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.7, 5)
    function makeWhiskers(side: number) {
      const group = new THREE.Group()
      const angles = [-0.28, 0, 0.28]
      angles.forEach((angle) => {
        const w = new THREE.Mesh(whiskerGeo, whiskerMat)
        w.rotation.z = Math.PI / 2 + angle
        w.position.set(side * 0.35, 0, 0)
        group.add(w)
      })
      group.position.set(side * 0.08, -0.22, 0.65)
      return group
    }
    headGroup.add(makeWhiskers(-1), makeWhiskers(1))

    // ---- legs + paws ----
    const legGeo = new THREE.CylinderGeometry(0.15, 0.17, 0.36, 12)
    const pawGeo = new THREE.SphereGeometry(0.17, 14, 10)
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(legGeo, furMain)
      leg.position.set(side * 0.52, -0.72, 0.82)
      cat.add(leg)
      const paw = new THREE.Mesh(pawGeo, furCream)
      paw.scale.set(1, 0.65, 1.1)
      paw.position.set(side * 0.52, -0.9, 0.95)
      cat.add(paw)
    }

    // ---- tail: curved tube that can swish naturally ----
    const tailGroup = new THREE.Group()
    const tailCurve = makeTailCurve()
    const tailGeo = new THREE.TubeGeometry(tailCurve, 24, 0.13, 8, false)
    const tailMesh = new THREE.Mesh(tailGeo, furMain)
    tailGroup.add(tailMesh)
    const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), furDark)
    const tipPoint = tailCurve.getPoint(1)
    tailTip.position.copy(tipPoint)
    tailGroup.add(tailTip)
    tailGroup.position.set(0, 0.1, -1.3)
    cat.add(tailGroup)

    cat.rotation.y = -0.3
    scene.add(cat)

    let frame = 0
    let raf = 0
    const clock = new THREE.Clock()
    let pettingFlag = false

    const animate = () => {
      raf = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      frame++

      // idle breathing + slow tail swish + ear twitch + gentle blink
      body.scale.y = 0.82 + Math.sin(t * 1.6) * 0.015
      tailGroup.rotation.y = Math.sin(t * 0.9) * 0.4
      tailGroup.rotation.z = Math.cos(t * 0.7) * 0.08
      earL.rotation.x = Math.sin(t * 2.1) * 0.06
      earR.rotation.x = Math.sin(t * 2.1 + 0.5) * 0.06

      const blink = Math.sin(t * 0.6) > 0.985 ? 0.12 : 1
      const squint = pettingFlag ? 0.25 : blink
      eyeL.scale.y = THREE.MathUtils.lerp(eyeL.scale.y, squint, 0.4)
      eyeR.scale.y = THREE.MathUtils.lerp(eyeR.scale.y, squint, 0.4)

      if (pettingFlag) {
        cat.rotation.z = Math.sin(t * 14) * 0.05
        headGroup.position.y = 0.58 - Math.abs(Math.sin(t * 10)) * 0.07
        headGroup.rotation.z = Math.sin(t * 10) * 0.06
      } else {
        cat.rotation.z = 0
        headGroup.position.y = 0.58
        headGroup.rotation.z *= 0.8
      }
      renderer.render(scene, camera)
    }
    animate()

    let pettingTimeout: number | undefined
    const canvas = renderer.domElement
    canvas.style.cursor = 'pointer'
    canvas.addEventListener('click', () => {
      pettingFlag = true
      playCatPurr()
      setPetting(true)
      setHearts((h) => [...h, { id: frame, x: Math.random() * 60 - 30 }])
      window.clearTimeout(pettingTimeout)
      pettingTimeout = window.setTimeout(() => {
        pettingFlag = false
        setPetting(false)
      }, 650)
    })

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(pettingTimeout)
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  useEffect(() => {
    if (hearts.length === 0) return
    const timer = setTimeout(() => setHearts((h) => h.slice(1)), 1200)
    return () => clearTimeout(timer)
  }, [hearts])

  return (
    <div className="cat-corner" aria-label="En hyggelig kat du kan klappe ved at klikke på den">
      {hearts.map((h) => (
        <span key={h.id} className="cat-heart" style={{ left: `calc(50% + ${h.x}px)` }}>
          ♥
        </span>
      ))}
      <div ref={mountRef} className={petting ? 'cat-canvas petting' : 'cat-canvas'} />
      <p className="cat-label">{petting ? 'Mjav! 🐾' : 'Klap mig'}</p>
    </div>
  )
}
