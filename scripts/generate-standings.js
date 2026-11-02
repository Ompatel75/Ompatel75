// scripts/generate-standings.js — Four-platform standings panel SVG

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

function loadCache(path) {
  if (!existsSync(path)) return null;
  try { return JSON.parse(readFileSync(path, 'utf8')); }
  catch { return null; }
}

function getRankColor(platform, rating) {
  if (platform === 'cf') {
    if (rating >= 3000) return '#ff0000';
    if (rating >= 2400) return '#ff8c00';
    if (rating >= 2100) return '#ff8c00';
    if (rating >= 1900) return '#a040a0';
    if (rating >= 1600) return '#0000ff';
    if (rating >= 1400) return '#03a89e';
    if (rating >= 1200) return '#008000';
    return '#808080';
  }
  if (platform === 'ac') {
    if (rating >= 2800) return '#ff0000';
    if (rating >= 2400) return '#ff8c00';
    if (rating >= 2000) return '#c0c000';
    if (rating >= 1600) return '#0000ff';
    if (rating >= 1200) return '#00C0C0';
    if (rating >= 800) return '#008000';
    return '#808080';
  }
  if (platform === 'lc') return '#ff0080';
  if (platform === 'cc') return '#f5a623';
  return '#8b949e';
}

export function generateStandings() {
  const cf = loadCache('data/cache/cf.json');
  const lc = loadCache('data/cache/lc.json');
  const ac = loadCache('data/cache/ac.json');

  const W = 1200, H = 120;
  const cardW = 280, cardH = 100, gap = 16;
  const startX = (W - (4 * cardW + 3 * gap)) / 2;

  const platforms = [
    {
      id: 'cf',
      name: 'CODEFORCES',
      handle: cf?.handle || 'Omm_Patel',
      rating: cf?.rating ?? '—',
      rank: cf?.rank || 'Expert',
      solved: cf?.solvedCount ?? '—',
      color: cf ? getRankColor('cf', cf.rating) : '#8b949e',
      badge: 'EXPERT',
      extra: `max ${cf?.maxRating ?? '—'}`,
    },
    {
      id: 'lc',
      name: 'LEETCODE',
      handle: lc?.handle || 'om_patel11',
      rating: lc?.currentContestRating ?? '—',
      rank: lc?.badge || 'Knight',
      solved: lc?.totalSolved ?? '—',
      color: getRankColor('lc', 0),
      badge: 'KNIGHT',
      extra: `${lc?.hardSolved ?? '—'} hard`,
    },
    {
      id: 'cc',
      name: 'CODECHEF',
      handle: 'om_patel_007',
      rating: '—',
      rank: '3★',
      solved: '—',
      color: '#f5a623',
      badge: '3★',
      extra: 'no API',
    },
    {
      id: 'ac',
      name: 'ATCODER',
      handle: ac?.handle || 'Om_patel07',
      rating: ac?.rating ?? '—',
      rank: 'Cyan',
      solved: ac?.solvedCount ?? '—',
      color: '#00C0C0',
      badge: 'CYAN',
      extra: `${ac?.ratingHistory?.length ?? '—'} contests`,
    },
  ];

  const totalSolved = (cf?.solvedCount || 0) + (lc?.totalSolved || 0) + (ac?.solvedCount || 0);

  const cards = platforms.map((p, i) => {
    const x = startX + i * (cardW + gap);
    const y = 10;
    return `
  <!-- ${p.name} card -->
  <rect x="${x}" y="${y}" width="${cardW}" height="${cardH}" rx="6"
        fill="#161b22" stroke="${p.color}" stroke-width="1.5"/>
  <!-- Glow top border -->
  <rect x="${x}" y="${y}" width="${cardW}" height="3" rx="2" fill="${p.color}" opacity="0.8">
    <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite"/>
  </rect>
  <!-- Platform name -->
  <text x="${x + cardW/2}" y="${y + 20}" text-anchor="middle"
        font-family="'Courier New',Courier,monospace" font-size="10"
        fill="${p.color}" letter-spacing="2" font-weight="bold">${p.name}</text>
  <!-- Handle -->
  <text x="${x + cardW/2}" y="${y + 34}" text-anchor="middle"
        font-family="'Courier New',Courier,monospace" font-size="10"
        fill="#8b949e">@${p.handle}</text>
  <!-- Rating (large) -->
  <text x="${x + cardW/2}" y="${y + 60}" text-anchor="middle"
        font-family="'Courier New',Courier,monospace" font-size="24"
        fill="${p.color}" font-weight="bold">${p.rating}</text>
  <!-- Badge -->
  <rect x="${x + cardW/2 - 30}" y="${y + 65}" width="60" height="15" rx="3"
        fill="${p.color}" opacity="0.15"/>
  <text x="${x + cardW/2}" y="${y + 76}" text-anchor="middle"
        font-family="'Courier New',Courier,monospace" font-size="9"
        fill="${p.color}" font-weight="bold">${p.badge}</text>
  <!-- Solved / extra -->
  <text x="${x + 10}" y="${y + 94}" font-family="'Courier New',Courier,monospace"
        font-size="9" fill="#8b949e">solved: ${p.solved}</text>
  <text x="${x + cardW - 10}" y="${y + 94}" text-anchor="end"
        font-family="'Courier New',Courier,monospace" font-size="9" fill="#8b949e">${p.extra}</text>`;
  }).join('');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"
     width="${W}" height="${H}" role="img" aria-label="Competitive Programming Standings">
  <title>CP Standings — Om Patel</title>
  <defs>
    <style>
      @media (prefers-reduced-motion: reduce) { animate { display: none; } }
    </style>
  </defs>
  <rect width="${W}" height="${H}" fill="#0d1117"/>
  ${cards}
  <!-- Total solved counter -->
  <text x="${W/2}" y="${H - 4}" text-anchor="middle"
        font-family="'Courier New',Courier,monospace" font-size="10" fill="#8b949e">
    1300+ problems solved across all platforms
  </text>
</svg>`;

  mkdirSync('assets', { recursive: true });
  writeFileSync('assets/standings.svg', svg);
  console.log('[STANDINGS] Generated assets/standings.svg');
  return svg;
}

if (process.argv[1].endsWith('generate-standings.js')) {
  generateStandings();
}

