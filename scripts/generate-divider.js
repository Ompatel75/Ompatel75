// scripts/generate-divider.js — Animated pulse-line divider SVG

import { writeFileSync, mkdirSync } from 'fs';

export function generateDivider() {
  const W = 1200, H = 8;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"
     width="${W}" height="${H}" role="presentation">
  <defs>
    <linearGradient id="divGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0d1117"/>
      <stop offset="25%" stop-color="#7928ca"/>
      <stop offset="50%" stop-color="#ff0080"/>
      <stop offset="75%" stop-color="#00dfd8"/>
      <stop offset="100%" stop-color="#0d1117"/>
      <animate attributeName="x1" values="-1;0;-1" dur="4s" repeatCount="indefinite"/>
      <animate attributeName="x2" values="0;2;0" dur="4s" repeatCount="indefinite"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="#0d1117"/>
  <rect x="0" y="3" width="${W}" height="2" fill="url(#divGrad)" filter="url(#glow)"/>
  <!-- Traveling pulse dot -->
  <circle r="4" cy="4" fill="#ffffff" opacity="0.9" filter="url(#glow)">
    <animate attributeName="cx" values="-8;${W+8}" dur="4s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;1;1;0" values="0;0.9;0.9;0" dur="4s" repeatCount="indefinite"/>
  </circle>
</svg>`;

  mkdirSync('assets', { recursive: true });
  writeFileSync('assets/divider.svg', svg);
  console.log('[DIV] Generated assets/divider.svg');
  return svg;
}

if (process.argv[1].endsWith('generate-divider.js')) {
  generateDivider();
}
