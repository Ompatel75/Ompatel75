// scripts/generate-hero.js — Animated hero banner SVG (1200×280)
// Concept: futuristic contest scoreboard header with gradient mesh, scan line,
// stroke-draw name, and scrolling verdict ticker

import { writeFileSync, mkdirSync } from 'fs';

export function generateHero() {
  const W = 1200, H = 280;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"
     role="img" aria-label="Om Patel — Competitive Programmer">
  <title>Om Patel — Competitive Programmer</title>
  <defs>
    <!-- Gradient mesh background -->
    <radialGradient id="g1" cx="20%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#7928ca" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#0d1117" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="80%" cy="70%" r="55%">
      <stop offset="0%" stop-color="#ff0080" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#0d1117" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g3" cx="55%" cy="20%" r="40%">
      <stop offset="0%" stop-color="#00dfd8" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#0d1117" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#00dfd8" stop-opacity="0"/>
      <stop offset="40%" stop-color="#00dfd8" stop-opacity="0.6"/>
      <stop offset="60%" stop-color="#ffffff" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#00dfd8" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="nameGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ff0080"/>
      <stop offset="50%" stop-color="#7928ca"/>
      <stop offset="100%" stop-color="#00dfd8"/>
    </linearGradient>
    <!-- Grid mask -->
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#30363d" stroke-width="0.5" opacity="0.4"/>
    </pattern>
    <!-- Glow filter -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="glowStrong" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <!-- Ticker clip -->
    <clipPath id="tickerClip">
      <rect x="0" y="240" width="${W}" height="36"/>
    </clipPath>
    <!-- Reduced motion: disable most animations -->
    <style>
      @media (prefers-reduced-motion: reduce) {
        .anim { animation: none !important; }
        .smil-anim { display: none; }
      }
    </style>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="#0d1117"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect width="${W}" height="${H}" fill="url(#g1)">
    <animate attributeName="opacity" values="1;0.7;1" dur="8s" repeatCount="indefinite"/>
  </rect>
  <rect width="${W}" height="${H}" fill="url(#g2)">
    <animate attributeName="opacity" values="0.7;1;0.7" dur="10s" repeatCount="indefinite"/>
  </rect>
  <rect width="${W}" height="${H}" fill="url(#g3)">
    <animate attributeName="opacity" values="1;0.5;1" dur="6s" repeatCount="indefinite"/>
  </rect>

  <!-- Corner decorations -->
  <polyline points="0,0 60,0 60,4" fill="none" stroke="#ff0080" stroke-width="2"/>
  <polyline points="0,0 0,50 4,50" fill="none" stroke="#ff0080" stroke-width="2"/>
  <polyline points="${W},0 ${W-60},0 ${W-60},4" fill="none" stroke="#00dfd8" stroke-width="2"/>
  <polyline points="${W},0 ${W},50 ${W-4},50" fill="none" stroke="#00dfd8" stroke-width="2"/>
  <polyline points="0,${H} 60,${H} 60,${H-4}" fill="none" stroke="#7928ca" stroke-width="2"/>
  <polyline points="0,${H} 0,${H-50} 4,${H-50}" fill="none" stroke="#7928ca" stroke-width="2"/>
  <polyline points="${W},${H} ${W-60},${H} ${W-60},${H-4}" fill="none" stroke="#ff0080" stroke-width="2"/>
  <polyline points="${W},${H} ${W},${H-50} ${W-4},${H-50}" fill="none" stroke="#ff0080" stroke-width="2"/>

  <!-- Horizontal rule lines -->
  <line x1="0" y1="230" x2="${W}" y2="230" stroke="#30363d" stroke-width="1"/>
  <line x1="0" y1="236" x2="${W}" y2="236" stroke="#7928ca" stroke-width="0.5" opacity="0.5"/>

  <!-- Scanning light line -->
  <rect width="${W}" height="4" fill="url(#scanGrad)" opacity="0.8">
    <animateTransform attributeName="transform" type="translate" values="0,0;0,${H};0,0"
      dur="3s" repeatCount="indefinite" calcMode="linear"/>
  </rect>

  <!-- JUDGE CONSOLE label -->
  <text x="24" y="28" font-family="'Courier New',Courier,monospace" font-size="11"
        fill="#7928ca" letter-spacing="4" opacity="0.9">JUDGE CONSOLE v2.0</text>
  <text x="${W-24}" y="28" font-family="'Courier New',Courier,monospace" font-size="11"
        fill="#00dfd8" letter-spacing="2" text-anchor="end" opacity="0.9">DA-IICT · 2024–2028</text>

  <!-- Main name: OM PATEL — drawn with stroke animation -->
  <text x="${W/2}" y="135" text-anchor="middle"
        font-family="'Courier New',Courier,monospace" font-size="72" font-weight="bold"
        letter-spacing="12" fill="none" stroke="url(#nameGrad)" stroke-width="2"
        filter="url(#glowStrong)">
    OM PATEL
    <animate attributeName="stroke-dashoffset" values="1000;0" dur="2s"
             calcMode="ease" fill="freeze"/>
    <animate attributeName="stroke-dasharray" values="0,1000;1000,0" dur="2s"
             calcMode="ease" fill="freeze"/>
  </text>
  <!-- Solid fill version (delayed) -->
  <text x="${W/2}" y="135" text-anchor="middle"
        font-family="'Courier New',Courier,monospace" font-size="72" font-weight="bold"
        letter-spacing="12" fill="url(#nameGrad)" opacity="0" filter="url(#glow)">
    OM PATEL
    <animate attributeName="opacity" values="0;0;1" dur="2.5s" calcMode="linear" fill="freeze"/>
  </text>

  <!-- Subtitle -->
  <text x="${W/2}" y="175" text-anchor="middle"
        font-family="'Courier New',Courier,monospace" font-size="16"
        fill="#8b949e" letter-spacing="3" opacity="0">
    COMPETITIVE PROGRAMMER · B.TECH ICT · OPEN TO INTERNSHIPS
    <animate attributeName="opacity" values="0;0;1" dur="3s" calcMode="linear" fill="freeze"/>
  </text>

  <!-- Rating badges (inline) -->
  <g transform="translate(${W/2 - 280}, 195)" opacity="0">
    <animate attributeName="opacity" values="0;0;1" dur="3.5s" calcMode="linear" fill="freeze"/>
    <!-- CF Expert badge -->
    <rect x="0" y="0" width="130" height="24" rx="4" fill="#161b22" stroke="#0000ff" stroke-width="1"/>
    <text x="65" y="16" text-anchor="middle" font-family="'Courier New',Courier,monospace"
          font-size="11" fill="#0000ff" font-weight="bold">CF EXPERT ~1640</text>
    <!-- LC Knight badge -->
    <rect x="140" y="0" width="130" height="24" rx="4" fill="#161b22" stroke="#ff0080" stroke-width="1"/>
    <text x="205" y="16" text-anchor="middle" font-family="'Courier New',Courier,monospace"
          font-size="11" fill="#ff0080" font-weight="bold">LC KNIGHT</text>
    <!-- CC 3★ badge -->
    <rect x="280" y="0" width="130" height="24" rx="4" fill="#161b22" stroke="#f5a623" stroke-width="1"/>
    <text x="345" y="16" text-anchor="middle" font-family="'Courier New',Courier,monospace"
          font-size="11" fill="#f5a623" font-weight="bold">CC ★★★</text>
    <!-- AC Cyan badge -->
    <rect x="420" y="0" width="130" height="24" rx="4" fill="#161b22" stroke="#00C0C0" stroke-width="1"/>
    <text x="485" y="16" text-anchor="middle" font-family="'Courier New',Courier,monospace"
          font-size="11" fill="#00C0C0" font-weight="bold">AC CYAN</text>
  </g>

  <!-- Verdict ticker bar -->
  <rect x="0" y="240" width="${W}" height="36" fill="#0d1117"/>
  <rect x="0" y="240" width="${W}" height="36" fill="url(#g1)" opacity="0.2"/>
  <rect x="0" y="240" width="2" height="36" fill="#ff0080"/>
  <rect x="${W-2}" y="240" width="2" height="36" fill="#00dfd8"/>

  <text y="264" clip-path="url(#tickerClip)"
        font-family="'Courier New',Courier,monospace" font-size="14" letter-spacing="2">
    <!-- Repeated sequence for seamless loop -->
    <tspan fill="#39d353" font-weight="bold">AC </tspan>
    <tspan fill="#8b949e">·</tspan>
    <tspan fill="#39d353" font-weight="bold"> AC </tspan>
    <tspan fill="#8b949e">·</tspan>
    <tspan fill="#ff0080" font-weight="bold"> WA </tspan>
    <tspan fill="#8b949e">·</tspan>
    <tspan fill="#39d353" font-weight="bold"> AC </tspan>
    <tspan fill="#8b949e">·</tspan>
    <tspan fill="#39d353" font-weight="bold"> AC </tspan>
    <tspan fill="#8b949e">·</tspan>
    <tspan fill="#f5a623" font-weight="bold"> TLE </tspan>
    <tspan fill="#8b949e">·</tspan>
    <tspan fill="#39d353" font-weight="bold"> AC </tspan>
    <tspan fill="#8b949e">·</tspan>
    <tspan fill="#39d353" font-weight="bold"> AC </tspan>
    <tspan fill="#8b949e">·</tspan>
    <tspan fill="#ff0080" font-weight="bold"> MLE </tspan>
    <tspan fill="#8b949e">·</tspan>
    <tspan fill="#39d353" font-weight="bold"> AC </tspan>
    <tspan fill="#8b949e">·</tspan>
    <tspan fill="#39d353" font-weight="bold"> AC </tspan>
    <tspan fill="#8b949e">·</tspan>
    <tspan fill="#39d353" font-weight="bold"> AC </tspan>
    <tspan fill="#8b949e">·</tspan>
    <tspan fill="#ff0080" font-weight="bold"> WA </tspan>
    <tspan fill="#8b949e">·</tspan>
    <tspan fill="#39d353" font-weight="bold"> AC </tspan>
    <tspan fill="#8b949e">·</tspan>
    <tspan fill="#39d353" font-weight="bold"> AC </tspan>
    <tspan fill="#8b949e">·</tspan>
    <tspan fill="#39d353" font-weight="bold"> AC </tspan>
    <tspan fill="#8b949e">·</tspan>
    <tspan fill="#f5a623" font-weight="bold"> TLE </tspan>
    <tspan fill="#8b949e">·</tspan>
    <tspan fill="#39d353" font-weight="bold"> AC </tspan>
    <tspan fill="#8b949e">·</tspan>
    <tspan fill="#39d353" font-weight="bold"> AC </tspan>
    <animateTransform attributeName="transform" type="translate"
      values="${W},0;-2400,0" dur="20s" repeatCount="indefinite" calcMode="linear"/>
  </text>
  <text x="8" y="258" font-family="'Courier New',Courier,monospace"
        font-size="9" fill="#7928ca" letter-spacing="1">VERDICTS</text>
</svg>`;

  mkdirSync('assets', { recursive: true });
  writeFileSync('assets/hero.svg', svg);
  console.log('[HERO] Generated assets/hero.svg');
  return svg;
}

if (process.argv[1].endsWith('generate-hero.js')) {
  generateHero();
}
