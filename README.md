# Vores Hyggekrog — Fotobog

En hyggelig, ældrevenlig fotobog-side bygget med Vite + React + TypeScript + Tailwind,
med en lille 3D-kat (three.js) man kan klappe.

## Funktioner

- Hele siden er på dansk med store, letlæselige bogstaver (skrifttypen "Atkinson
  Hyperlegible" er designet til god læsbarhed)
- En fotobog man åbner ved at trykke på bogen — upload billeder, og de bliver automatisk
  fordelt på sider
- Vælg om der skal være 1, 4 (2×2) eller 9 (3×3) billeder pr. side
- Bladring mellem sider med en side-vendings-animation og -lyd
- Slet-knap på hvert billede
- En 3D-kat i hjørnet man kan klappe med et museklik/tryk
- En pejs-knap med knitrende ild-lyd
- Temavælger: 20 farvenuancer + 5 baggrunde (gården, stuen, skrivebordet, terrassen,
  stranden) — lyserød/hvid er standard
- Billederne gemmes som blobs i IndexedDB i browseren (ikke på en server), så der er
  plads til tusindvis af billeder uden at skulle logge ind
- Installerbar som en app (PWA) via manifest + service worker

## Kør det

```bash
npm install
npm run dev
```

## Deploy til GitHub Pages

`.github/workflows/deploy.yml` deployer automatisk til GitHub Pages ved push til `main`.
Aktivér det under repoets **Settings → Pages → Source → GitHub Actions**.
