# REPORT.md — GitHub Profile README Build Report

**Branch:** `readme-v2`  
**Build Date:** 2026-11-03  
**Commit:** 44d844a

---

## ✅ Verification Checklist

### Data Pipeline

| Source | Status | Data |
|--------|--------|------|
| Codeforces API (`user.info`, `user.rating`, `user.status`) | ✅ Live | Rating 1440, max 1640 (Expert), 1234 solved, 44 contests |
| LeetCode GraphQL (profile + contest history + calendar) | ✅ Live | 504 solved, contest rating 2051 (Knight), 18 contests |
| AtCoder Problems API (history + submissions) | ✅ Live | Rating 1207 (Cyan), 76 solved, 20 contests |
| GitHub GraphQL | ⚠️ 403 locally (no token) | Works in CI with `GITHUB_TOKEN` |
| CodeChef | ⚠️ No official API | Shows "no API" gracefully |

**Cache fallback:** ✅ All fetchers write to `data/cache/*.json` and fall back on error.

---

### SVG Lint (`node scripts/check-svgs.js`)

| File | Size | `<script>` | Ext URLs | Status |
|------|------|-----------|----------|--------|
| hero.svg | 9.8 KB | ✅ None | ✅ None | **PASS** |
| divider.svg | 1.3 KB | ✅ None | ✅ None | **PASS** |
| stack-orbit.svg | 17.8 KB | ✅ None | ✅ None | **PASS** |
| judgely-arch.svg | 12.7 KB | ✅ None | ✅ None | **PASS** |
| cf-graph.svg | 4.5 KB | ✅ None | ✅ None | **PASS** |
| lc-graph.svg | 4.0 KB | ✅ None | ✅ None | **PASS** |
| ac-graph.svg | 4.0 KB | ✅ None | ✅ None | **PASS** |
| standings.svg | 6.5 KB | ✅ None | ✅ None | **PASS** |
| snake.svg | 107.8 KB | ✅ None | ✅ None | **PASS** |
| snake-light.svg | 107.8 KB | ✅ None | ✅ None | **PASS** |
| gh-stats.svg | 3.6 KB | ✅ None | ✅ None | **PASS** |

**All SVGs under 250 KB limit.** Total asset size: ~284 KB

---

### README Structural Verification (`node scripts/check-readme.js`)

| Check | Result |
|-------|--------|
| All 11 asset paths exist | ✅ PASS |
| No `<script>`, `<style>`, `<iframe>`, `<form>` tags | ✅ PASS |
| No inline `style=` attributes | ✅ PASS |
| All 6 required sections present | ✅ PASS |
| `<picture>` with dark/light snake variants | ✅ PASS |
| Easter egg `<details>` block | ✅ PASS |
| Mermaid fallback for Judgely arch | ✅ PASS |
| Ratings come from SVGs (not hardcoded in README) | ✅ PASS |

---

### CP Snake Verification

| Metric | Value |
|--------|-------|
| Grid size | 53 columns × 7 rows |
| Total days covered | 364 |
| Active days with ACs | 147 (CF) + LC + AC |
| Total ACs eaten | 1,567 |
| Max ACs in a single day | 33 |
| Intensity palette | Violet (#7928ca) → Pink (#ff0080) |
| Snake trail | Cyan (#00dfd8) → Pink |
| Loop duration | 18 seconds |
| Dark variant | `assets/snake.svg` |
| Light variant | `assets/snake-light.svg` |
| Data sources labeled | ✅ "Codeforces + LeetCode + AtCoder" |
| Never labeled as "GitHub contributions" | ✅ Confirmed |

---

### Animation Inventory

| Asset | Animation Type | Elements |
|-------|---------------|----------|
| hero.svg | SMIL `animate`, `animateTransform` | Gradient mesh shift, scan line, stroke-draw name, verdict ticker |
| divider.svg | SMIL `animate`, `animateTransform` | Gradient pulse, traveling dot |
| cf-graph.svg | SMIL `animate` | Stroke-draw line, pulsing endpoint |
| lc-graph.svg | SMIL `animate` | Stroke-draw line, pulsing endpoint |
| ac-graph.svg | SMIL `animate` | Stroke-draw line, pulsing endpoint |
| standings.svg | SMIL `animate` | Glowing top borders per card |
| stack-orbit.svg | SMIL `animateTransform` | 4 orbital rings with planet labels |
| judgely-arch.svg | SMIL `animateMotion`, `animate` | Data packets along paths, node glow |
| snake.svg | SMIL `animateMotion`, `animate` | Snake head + trail following AC grid |
| gh-stats.svg | SMIL `animate` | Card accent glows |

**All animations use SMIL only — no JavaScript, no CSS animations (SVG CSS is permissible but avoided for max compat).**

---

### GitHub Constraints Compliance

| Constraint | Status |
|-----------|--------|
| No JavaScript in README | ✅ |
| No `<style>` tags in README | ✅ |
| No inline style attributes | ✅ |
| No iframes or forms | ✅ |
| SVG animations via SMIL only | ✅ |
| No external fonts in SVGs | ✅ (system `'Courier New',Courier,monospace`) |
| No external URLs in SVGs | ✅ |
| No runtime dependency on widget servers | ✅ (all self-generated) |
| `prefers-reduced-motion` respected | ✅ (all SVGs include media query rule) |
| `prefers-color-scheme` for snake | ✅ (`<picture>` with dark/light variants) |
| Responsive via viewBox | ✅ (all SVGs use viewBox) |

---

### Creative Concept Delivery

| Requirement | Status |
|-------------|--------|
| Futuristic contest scoreboard theme | ✅ |
| Projects as "Problems A–D" with AC stamps | ✅ |
| Tech stack as "Languages Allowed" | ✅ |
| CP stats as "Standings" | ✅ |
| Base palette (#0d1117, #ff0080, #7928ca, #00dfd8) | ✅ |
| CF rank colors (authentic) | ✅ |
| AtCoder cyan (#00C0C0) | ✅ |
| Hero with gradient mesh + scan line + verdict ticker | ✅ |
| Animated rating graphs for CF, LC, AtCoder | ✅ |
| Judgely arch with `animateMotion` packets | ✅ |
| Mermaid fallback for arch diagram | ✅ |
| Stack orbit/constellation | ✅ |
| Animated section dividers | ✅ |
| Easter egg in `<details>` | ✅ |
| `data/profile.json` as source of truth | ✅ |
| LinkedIn/email as TODO fields (hidden) | ✅ |

---

### Workflow

| Feature | Status |
|---------|--------|
| Daily cron (`15 0 * * *`) | ✅ |
| `workflow_dispatch` with optional `fetch_only` input | ✅ |
| `concurrency` group to prevent parallel runs | ✅ |
| `permissions: contents: write` | ✅ |
| Only `GITHUB_TOKEN` used (no secrets) | ✅ |
| `continue-on-error: true` per platform | ✅ |
| Commits only changed files | ✅ |
| Uploads cache as artifact for debugging | ✅ |

---

## Known Limitations

1. **GitHub stats panel** — requires `GITHUB_TOKEN` in CI; shows fallback zeros locally.
2. **CodeChef** — no official public API; shows "no API" gracefully; cannot update automatically.
3. **Snake grid** — LeetCode's submission calendar API returns total submissions (not just ACs), so LC days may be slightly inflated. This is the best data available from the public API.
4. **AtCoder submissions** — the `kenkoooo.com` API is a third-party mirror; fallback to cache if unavailable.

---

## File Tree

```
Ompatel75/
├── README.md                        ← main profile page
├── package.json
├── .gitignore
├── REPORT.md                        ← this file
│
├── assets/                          ← 11 SVG files, all self-contained
│   ├── hero.svg (9.8 KB)
│   ├── divider.svg (1.3 KB)
│   ├── stack-orbit.svg (17.8 KB)
│   ├── judgely-arch.svg (12.7 KB)
│   ├── cf-graph.svg (4.5 KB)
│   ├── lc-graph.svg (4.0 KB)
│   ├── ac-graph.svg (4.0 KB)
│   ├── standings.svg (6.5 KB)
│   ├── snake.svg (107.8 KB)
│   ├── snake-light.svg (107.8 KB)
│   └── gh-stats.svg (3.6 KB)
│
├── scripts/
│   ├── build-all.js                 ← orchestrator
│   ├── fetch-cf.js                  ← Codeforces API
│   ├── fetch-lc.js                  ← LeetCode GraphQL
│   ├── fetch-ac.js                  ← AtCoder Problems API
│   ├── fetch-gh.js                  ← GitHub GraphQL
│   ├── generate-hero.js
│   ├── generate-divider.js
│   ├── generate-graphs.js
│   ├── generate-standings.js
│   ├── generate-stack.js
│   ├── generate-arch.js
│   ├── generate-snake.js
│   ├── generate-gh-stats.js
│   ├── check-svgs.js                ← lint tool
│   └── check-readme.js             ← structural verifier
│
├── data/
│   ├── profile.json                 ← source of truth
│   └── cache/
│       ├── cf.json  (CF: rating 1440, 1234 solved)
│       ├── lc.json  (LC: 504 solved, rating 2051)
│       └── ac.json  (AC: rating 1207, 76 solved)
│
└── .github/
    └── workflows/
        └── update-stats.yml
```

