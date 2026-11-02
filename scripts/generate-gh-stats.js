// scripts/generate-gh-stats.js — GitHub stats panel SVG

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

function loadCache(path) {
  if (!existsSync(path)) return null;
  try { return JSON.parse(readFileSync(path, 'utf8')); }
  catch { return null; }
}

export function generateGHStats() {
  const gh = loadCache('data/cache/gh.json');
  const W = 1100, H = 140;

  const stats = [
    { label: 'REPOS', value: gh?.totalRepos ?? '—', color: '#7928ca' },
    { label: 'COMMITS', value: gh?.totalCommits ?? '—', color: '#ff0080' },
    { label: 'PRs', value: gh?.totalPRs ?? '—', color: '#00dfd8' },
    { label: 'STARS', value: gh?.totalStars ?? '—', color: '#f5a623' },
    { label: 'FOLLOWERS', value: gh?.followers ?? '—', color: '#39d353' },
  ];

  const cardW = 190, cardH = 100, gap = 20;
  const totalW = stats.length * cardW + (stats.length - 1) * gap;
  const startX = (W - totalW) / 2;

  const cards = stats.map((s, i) => {
    const x = startX + i * (cardW + gap);
    const y = 20;
    return `
  <rect x="${x}" y="${y}" width="${cardW}" height="${cardH}" rx="6"
        fill="#161b22" stroke="${s.color}" stroke-width="1" opacity="0.9"/>
  <rect x="${x}" y="${y}" width="${cardW}" height="2" fill="${s.color}">
    <animate attributeName="opacity" values="0.9;0.4;0.9" dur="3s" begin="${i*0.5}s" repeatCount="indefinite"/>
  </rect>
  <text x="${x + cardW/2}" y="${y + 22}" text-anchor="middle"
        font-family="'Courier New',Courier,monospace" font-size="9"
        fill="${s.color}" letter-spacing="2">${s.label}</text>
  <text x="${x + cardW/2}" y="${y + 65}" text-anchor="middle"
        font-family="'Courier New',Courier,monospace" font-size="30"
        fill="${s.color}" font-weight="bold">${s.value}</text>`;
  }).join('');

  // Top language bar
  const langs = Object.entries(gh?.languages || {}).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const langColors = ['#ff0080', '#7928ca', '#00dfd8', '#39d353', '#f5a623', '#0000ff'];
  const total = langs.reduce((s, [,v]) => s + v, 0) || 1;

  let langBar = '';
  let langX = startX;
  const barW = totalW, barH = 8, barY = H - 24;
  langs.forEach(([lang, count], i) => {
    const w = (count / total) * barW;
    langBar += `<rect x="${langX}" y="${barY}" width="${w.toFixed(1)}" height="${barH}" rx="2"
                      fill="${langColors[i]}" opacity="0.85"/>`;
    langX += w;
  });

  let langLabels = `<text x="${startX}" y="${H - 10}"
        font-family="'Courier New',Courier,monospace" font-size="8" fill="#8b949e">`;
  langs.forEach(([lang], i) => {
    langLabels += `<tspan fill="${langColors[i]}" dx="${i > 0 ? 12 : 0}">■ ${lang}</tspan>`;
  });
  langLabels += '</text>';

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"
     width="${W}" height="${H}" role="img" aria-label="GitHub Stats">
  <title>GitHub Stats — Om Patel</title>
  <defs>
    <style>
      @media (prefers-reduced-motion: reduce) { animate { display: none; } }
    </style>
  </defs>
  <rect width="${W}" height="${H}" fill="#0d1117"/>
  ${cards}
  ${langBar}
  ${langLabels}
</svg>`;

  mkdirSync('assets', { recursive: true });
  writeFileSync('assets/gh-stats.svg', svg);
  console.log('[GH] Generated assets/gh-stats.svg');
  return svg;
}

if (process.argv[1].endsWith('generate-gh-stats.js')) {
  generateGHStats();
}

