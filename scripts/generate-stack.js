// scripts/generate-stack.js — Tech stack constellation/orbit animation SVG

import { writeFileSync, mkdirSync } from 'fs';

export function generateStack() {
  const W = 1200, H = 320;
  const cx = W / 2, cy = H / 2;

  // Stack grouped by role with orbit radii
  const groups = [
    {
      label: 'LANGUAGES', color: '#ff0080', r: 70,
      items: ['C++', 'Python', 'JavaScript', 'SQL'],
      speed: 30, startAngle: 0,
    },
    {
      label: 'BACKEND', color: '#7928ca', r: 130,
      items: ['FastAPI', 'Celery', 'Redis', 'SQLAlchemy', 'Pydantic', 'JWT'],
      speed: 50, startAngle: 30,
    },
    {
      label: 'DATA', color: '#00dfd8', r: 180,
      items: ['PostgreSQL', 'pgAdmin', 'LaTeX'],
      speed: 70, startAngle: 60,
    },
    {
      label: 'DEVOPS', color: '#39d353', r: 230,
      items: ['Docker', 'Compose', 'GitHub Actions', 'Render', 'Linux', 'Git'],
      speed: 90, startAngle: 15,
    },
  ];

  let defs = `
    <filter id="glow">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="glowSoft">
      <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <style>
      @media (prefers-reduced-motion: reduce) {
        .orbit-planet { animation: none !important; }
        animateTransform { display: none; }
      }
    </style>`;

  // Orbit circles
  let orbits = groups.map(g => `
  <circle cx="${cx}" cy="${cy}" r="${g.r}" fill="none" stroke="${g.color}"
          stroke-width="0.5" stroke-dasharray="4,8" opacity="0.3"/>`).join('');

  // Center node — C++ (primary language)
  let nodes = `
  <!-- Center: C++ sun -->
  <circle cx="${cx}" cy="${cy}" r="28" fill="#161b22" stroke="#ff0080" stroke-width="2"
          filter="url(#glow)">
    <animate attributeName="stroke-width" values="2;3;2" dur="2s" repeatCount="indefinite"/>
  </circle>
  <text x="${cx}" y="${cy + 5}" text-anchor="middle"
        font-family="'Courier New',Courier,monospace" font-size="14" font-weight="bold"
        fill="#ff0080">C++</text>
  <!-- Pulse ring -->
  <circle cx="${cx}" cy="${cy}" r="28" fill="none" stroke="#ff0080" stroke-width="1" opacity="0.5">
    <animate attributeName="r" values="28;40;28" dur="2s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite"/>
  </circle>`;

  // Generate orbit group animations
  groups.forEach((g, gi) => {
    const n = g.items.length;
    g.items.forEach((item, i) => {
      const startDeg = g.startAngle + (360 / n) * i;
      const label = item.length > 10 ? item.slice(0, 9) + '…' : item;
      const nodeId = `node_${gi}_${i}`;
      const pid = `planet_${gi}_${i}`;

      // Planet orbits using animateTransform rotate around center
      nodes += `
  <!-- Orbit group ${gi} item ${i}: ${item} -->
  <g>
    <animateTransform attributeName="transform" type="rotate"
      from="${startDeg} ${cx} ${cy}" to="${startDeg + 360} ${cx} ${cy}"
      dur="${g.speed}s" repeatCount="indefinite"/>
    <g transform="translate(${cx + g.r}, ${cy})">
      <circle r="5" fill="${g.color}" opacity="0.8" filter="url(#glowSoft)">
        <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite"
          begin="${i * 0.3}s"/>
      </circle>
    </g>
    <g transform="translate(${cx + g.r}, ${cy})">
      <rect x="-${Math.max(label.length * 4, 20)}" y="-28" width="${Math.max(label.length * 8, 40)}" height="18" rx="3"
            fill="#0d1117" stroke="${g.color}" stroke-width="0.8" opacity="0.9"/>
      <text x="0" y="-16" text-anchor="middle"
            font-family="'Courier New',Courier,monospace" font-size="9"
            fill="${g.color}">${label}</text>
    </g>
  </g>`;
    });
  });

  // Legend
  let legend = `
  <!-- Legend -->`;
  groups.forEach((g, i) => {
    legend += `
  <rect x="20" y="${20 + i * 22}" width="10" height="10" rx="2" fill="${g.color}"/>
  <text x="36" y="${30 + i * 22}" font-family="'Courier New',Courier,monospace"
        font-size="10" fill="${g.color}">${g.label}</text>`;
  });

  // Section header
  const header = `
  <text x="${W/2}" y="20" text-anchor="middle"
        font-family="'Courier New',Courier,monospace" font-size="12"
        fill="#8b949e" letter-spacing="4">LANGUAGES ALLOWED · TECH STACK</text>`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"
     width="${W}" height="${H}" role="img" aria-label="Tech stack constellation">
  <title>Tech Stack — Om Patel</title>
  <defs>${defs}</defs>
  <rect width="${W}" height="${H}" fill="#0d1117"/>
  ${header}
  ${orbits}
  ${nodes}
  ${legend}
</svg>`;

  mkdirSync('assets', { recursive: true });
  writeFileSync('assets/stack-orbit.svg', svg);
  console.log('[STACK] Generated assets/stack-orbit.svg');
  return svg;
}

if (process.argv[1].endsWith('generate-stack.js')) {
  generateStack();
}
