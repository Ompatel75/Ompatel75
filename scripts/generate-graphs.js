// scripts/generate-graphs.js — Rating history graphs for CF, LC, AtCoder

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

const CF_RANK_COLORS = [
  { min: 3000, color: '#ff0000', label: 'Legendary Grandmaster' },
  { min: 2600, color: '#ff0000', label: 'International Grandmaster' },
  { min: 2400, color: '#ff8c00', label: 'Grandmaster' },
  { min: 2300, color: '#ff8c00', label: 'International Master' },
  { min: 2100, color: '#ff8c00', label: 'Master' },
  { min: 1900, color: '#a0a', label: 'Candidate Master' },
  { min: 1600, color: '#0000ff', label: 'Expert' },
  { min: 1400, color: '#03a89e', label: 'Specialist' },
  { min: 1200, color: '#008000', label: 'Pupil' },
  { min: 0, color: '#808080', label: 'Newbie' },
];

function getCFColor(rating) {
  for (const band of CF_RANK_COLORS) {
    if (rating >= band.min) return band.color;
  }
  return '#808080';
}

function getACColor(rating) {
  if (rating >= 2800) return '#ff0000';
  if (rating >= 2400) return '#ff8c00';
  if (rating >= 2000) return '#c0c000';
  if (rating >= 1600) return '#0000ff';
  if (rating >= 1200) return '#00C0C0'; // Cyan
  if (rating >= 800) return '#008000';
  if (rating >= 400) return '#804000';
  return '#808080';
}

function loadCache(path) {
  if (!existsSync(path)) return null;
  try { return JSON.parse(readFileSync(path, 'utf8')); }
  catch { return null; }
}

function buildGraph({ title, data, getColor, W = 600, H = 200, platform, currentRating, handle }) {
  if (!data || data.length === 0) {
    return buildEmptyGraph(title, platform, W, H);
  }

  const PAD = { top: 30, right: 20, bottom: 40, left: 60 };
  const gW = W - PAD.left - PAD.right;
  const gH = H - PAD.top - PAD.bottom;

  const ratings = data.map(d => d.rating);
  const minR = Math.min(...ratings) - 50;
  const maxR = Math.max(...ratings) + 100;
  const rangeR = maxR - minR;

  function scaleX(i) { return PAD.left + (i / (data.length - 1 || 1)) * gW; }
  function scaleY(r) { return PAD.top + gH - ((r - minR) / rangeR) * gH; }

  // Build polyline points
  const points = data.map((d, i) => `${scaleX(i).toFixed(1)},${scaleY(d.rating).toFixed(1)}`).join(' ');

  // Gradient area under the curve
  const areaPoints = [
    `${scaleX(0).toFixed(1)},${PAD.top + gH}`,
    ...data.map((d, i) => `${scaleX(i).toFixed(1)},${scaleY(d.rating).toFixed(1)}`),
    `${scaleX(data.length - 1).toFixed(1)},${PAD.top + gH}`,
  ].join(' ');

  const latestRating = data[data.length - 1].rating;
  const latestColor = getColor(latestRating);
  const latestX = scaleX(data.length - 1).toFixed(1);
  const latestY = scaleY(latestRating).toFixed(1);

  // Y-axis labels (3-4 lines)
  const yTicks = [minR, Math.round((minR + maxR) / 2), maxR].map(r => ({
    y: scaleY(r),
    label: Math.round(r),
  }));

  // Rank band backgrounds
  const bandRects = [];
  const relevantBands = CF_RANK_COLORS.filter(b => b.min < maxR && b.min >= minR - 200);

  // Compute total path length estimate for stroke animation
  const pathLen = data.length * 15; // rough estimate

  // Light/dark variants
  const bg = '#161b22';
  const textCol = '#8b949e';
  const lineCol = '#30363d';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"
     width="${W}" height="${H}" role="img" aria-label="${title} rating history">
  <title>${title} — Rating History</title>
  <defs>
    <linearGradient id="areaGrad_${platform}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${latestColor}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${latestColor}" stop-opacity="0.02"/>
    </linearGradient>
    <filter id="glow_${platform}">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <clipPath id="clip_${platform}">
      <rect x="${PAD.left}" y="${PAD.top}" width="${gW}" height="${gH}"/>
    </clipPath>
    <style>
      @media (prefers-reduced-motion: reduce) {
        .draw-anim { stroke-dashoffset: 0 !important; }
        .pulse { animation: none; }
      }
    </style>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" rx="8" fill="${bg}"/>
  <rect x="1" y="1" width="${W-2}" height="${H-2}" rx="7" fill="none" stroke="#30363d" stroke-width="1"/>

  <!-- Title -->
  <text x="${PAD.left}" y="20" font-family="'Courier New',Courier,monospace" font-size="12"
        fill="#e6edf3" font-weight="bold" letter-spacing="1">${title.toUpperCase()}</text>
  <text x="${W - PAD.right}" y="20" text-anchor="end" font-family="'Courier New',Courier,monospace"
        font-size="11" fill="${latestColor}" font-weight="bold">
    ${handle} · ${currentRating || latestRating}
  </text>

  <!-- Grid lines -->
  ${yTicks.map(t => `
  <line x1="${PAD.left}" y1="${t.y.toFixed(1)}" x2="${W - PAD.right}" y2="${t.y.toFixed(1)}"
        stroke="${lineCol}" stroke-width="0.5" stroke-dasharray="4,4"/>
  <text x="${PAD.left - 6}" y="${(t.y + 4).toFixed(1)}" text-anchor="end"
        font-family="'Courier New',Courier,monospace" font-size="9" fill="${textCol}">${t.label}</text>
  `).join('')}

  <!-- Area fill -->
  <polygon points="${areaPoints}" fill="url(#areaGrad_${platform})" clip-path="url(#clip_${platform})"/>

  <!-- Rating line — animated draw -->
  <polyline points="${points}" fill="none" stroke="${latestColor}" stroke-width="2"
            stroke-linejoin="round" stroke-linecap="round"
            clip-path="url(#clip_${platform})"
            stroke-dasharray="${pathLen}" stroke-dashoffset="${pathLen}">
    <animate attributeName="stroke-dashoffset" from="${pathLen}" to="0"
             dur="1.5s" calcMode="ease" fill="freeze"/>
  </polyline>

  <!-- Latest rating dot with pulse -->
  <circle cx="${latestX}" cy="${latestY}" r="5" fill="${latestColor}"
          filter="url(#glow_${platform})">
    <animate attributeName="r" values="5;8;5" dur="1.5s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="1;0.6;1" dur="1.5s" repeatCount="indefinite"/>
  </circle>
  <circle cx="${latestX}" cy="${latestY}" r="3" fill="#ffffff"/>

  <!-- X-axis date labels (first and last) -->
  <text x="${PAD.left}" y="${PAD.top + gH + 15}" text-anchor="middle"
        font-family="'Courier New',Courier,monospace" font-size="9" fill="${textCol}">
    ${data[0].date.slice(0, 7)}
  </text>
  <text x="${W - PAD.right}" y="${PAD.top + gH + 15}" text-anchor="middle"
        font-family="'Courier New',Courier,monospace" font-size="9" fill="${textCol}">
    ${data[data.length - 1].date.slice(0, 7)}
  </text>

  <!-- Axes -->
  <line x1="${PAD.left}" y1="${PAD.top}" x2="${PAD.left}" y2="${PAD.top + gH}"
        stroke="${lineCol}" stroke-width="1"/>
  <line x1="${PAD.left}" y1="${PAD.top + gH}" x2="${W - PAD.right}" y2="${PAD.top + gH}"
        stroke="${lineCol}" stroke-width="1"/>
</svg>`;
}

function buildEmptyGraph(title, platform, W, H) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" rx="8" fill="#161b22"/>
  <text x="${W/2}" y="${H/2 - 10}" text-anchor="middle" font-family="'Courier New',Courier,monospace"
        font-size="14" fill="#8b949e">${title}</text>
  <text x="${W/2}" y="${H/2 + 12}" text-anchor="middle" font-family="'Courier New',Courier,monospace"
        font-size="11" fill="#30363d">data loading...</text>
</svg>`;
}

export function generateGraphs() {
  mkdirSync('assets', { recursive: true });

  // Codeforces
  const cfData = loadCache('data/cache/cf.json');
  const cfSvg = buildGraph({
    title: 'Codeforces',
    platform: 'cf',
    data: cfData?.ratingHistory || [],
    getColor: getCFColor,
    currentRating: cfData?.rating,
    handle: cfData?.handle || 'Omm_Patel',
  });
  writeFileSync('assets/cf-graph.svg', cfSvg);
  console.log('[GRAPHS] Generated assets/cf-graph.svg');

  // LeetCode
  const lcData = loadCache('data/cache/lc.json');
  const lcSvg = buildGraph({
    title: 'LeetCode Contest',
    platform: 'lc',
    data: lcData?.contestHistory || [],
    getColor: () => '#ff0080',
    currentRating: lcData?.currentContestRating,
    handle: lcData?.handle || 'om_patel11',
  });
  writeFileSync('assets/lc-graph.svg', lcSvg);
  console.log('[GRAPHS] Generated assets/lc-graph.svg');

  // AtCoder
  const acData = loadCache('data/cache/ac.json');
  const acSvg = buildGraph({
    title: 'AtCoder',
    platform: 'ac',
    data: acData?.ratingHistory || [],
    getColor: getACColor,
    currentRating: acData?.rating,
    handle: acData?.handle || 'Om_patel07',
  });
  writeFileSync('assets/ac-graph.svg', acSvg);
  console.log('[GRAPHS] Generated assets/ac-graph.svg');
}

if (process.argv[1].endsWith('generate-graphs.js')) {
  generateGraphs();
}
