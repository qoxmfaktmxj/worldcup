import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const BASE = `http://localhost:${process.env.PORT ?? 3000}`
const OUT = 'screenshots'

const shots = [
  { name: 'home', path: '/', mobile: true },
  { name: 'schedule-filter', path: '/world-cup/2026/schedule', mobile: true },
  { name: 'final-ranking', path: '/world-cup/2002', mobile: true },
  { name: 'third-place', path: '/world-cup/2026/third-place', mobile: true },
  { name: 'bracket-mobile', path: '/world-cup/2002/bracket', mobile: true },
  { name: 'bracket-desktop', path: '/world-cup/2022/bracket', mobile: false },
]

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()

for (const s of shots) {
  const ctx = await browser.newContext(
    s.mobile
      ? { viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 }
      : { viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 },
  )
  const page = await ctx.newPage()
  await page.goto(BASE + s.path, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  const file = `${OUT}/${s.name}.png`
  await page.screenshot({ path: file, fullPage: true })
  console.log('saved', file)
  await ctx.close()
}

await browser.close()
