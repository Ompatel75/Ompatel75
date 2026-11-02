// scripts/generate-arch.js — Judgely architecture animated SVG
// animateMotion data packets travelling between nodes

import { writeFileSync, mkdirSync } from 'fs';

export function generateArch() {
  const W = 1100, H = 280;

  // Node positions (left to right flow)
  const nodes = [
    { id: 'user',     x: 60,  y: 140, label: 'USER',      color: '#00dfd8', sub: 'Browser' },
    { id: 'fastapi',  x: 240, y: 140, label: 'FASTAPI',   color: '#7928ca', sub: 'JWT Auth' },
    { id: 'redis',    x: 420, y: 80,  label: 'REDIS',     color: '#ff0080', sub: 'Queue' },
    { id: 'celery',   x: 420, y: 200, label: 'CELERY',    color: '#f5a623', sub: 'Worker' },
    { id: 'docker',   x: 620, y: 140, label: 'DOCKER',    color: '#39d353', sub: 'Sandbox' },
    { id: 'pg',       x: 820, y: 140, label: 'POSTGRES',  color: '#0000ff', sub: 'Database' },
    { id: 'verdict',  x: 1000, y: 140, label: 'VERDICT',  color: '#ff0080', sub: 'AC / WA' },
  ];

  // Connections (from → to, with path id)
  const edges = [
    { from: 'user',    to: 'fastapi', id: 'e1', label: 'submit',  color: '#00dfd8' },
    { from: 'fastapi', to: 'redis',   id: 'e2', label: 'enqueue', color: '#7928ca' },
    { from: 'redis',   to: 'celery',  id: 'e3', label: 'dequeue', color: '#ff0080' },
    { from: 'celery',  to: 'docker',  id: 'e4', label: 'run',     color: '#f5a623' },
    { from: 'docker',  to: 'pg',      id: 'e5', label: 'store',   color: '#39d353' },
    { from: 'pg',      to: 'verdict', id: 'e6', label: 'result',  color: '#00dfd8' },
  ];

  function getNode(id) { return nodes.find(n => n.id === id); }

  // Build paths for animateMotion
  function buildPath(fromId, toId) {
    const f = getNode(fromId), t = getNode(toId);
    // Straight line or slight curve
    const mx = (f.x + t.x) / 2;
    const my = f.y === t.y ? f.y - 20 : (f.y + t.y) / 2;
    return `M ${f.x + 38} ${f.y} Q ${mx} ${my} ${t.x - 38} ${t.y}`;
  }

  // Edge SVG
  const edgeSvg = edges.map((e, ei) => {
    const path = buildPath(e.from, e.to);
    const delay = ei * 0.8;
    const totalDur = edges.length * 0.8 + 0.6;
    return `
  <path id="${e.id}" d="${path}" fill="none" stroke="${e.color}"
        stroke-width="1.5" stroke-dasharray="4,4" opacity="0.5"/>
  <text dy="-6" font-family="'Courier New',Courier,monospace" font-size="8"
        fill="${e.color}" opacity="0.7">
    <textPath href="#${e.id}" startOffset="50%" text-anchor="middle">${e.label}</textPath>
  </text>
  <!-- Data packet -->
  <circle r="5" fill="${e.color}" opacity="0.9">
    <filter id="pktglow${ei}">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <animateMotion dur="${totalDur}s" begin="${delay}s" repeatCount="indefinite"
                   calcMode="linear" rotate="auto">
      <mpath href="#${e.id}"/>
    </animateMotion>
    <animate attributeName="opacity" values="0;1;1;0" dur="${totalDur}s" begin="${delay}s"
             repeatCount="indefinite"/>
  </circle>`;
  }).join('');

  // Node SVG (box with glowing border)
  const nodeSvg = nodes.map((n, ni) => {
    const bw = 76, bh = 56;
    const delay = ni * 0.8;
    return `
  <!-- Node: ${n.label} -->
  <g transform="translate(${n.x - bw/2}, ${n.y - bh/2})">
    <rect width="${bw}" height="${bh}" rx="6" fill="#161b22" stroke="${n.color}" stroke-width="1.5">
      <animate attributeName="stroke-width" values="1.5;2.5;1.5" dur="4s" begin="${delay}s"
               repeatCount="indefinite"/>
      <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="4s" begin="${delay}s"
               repeatCount="indefinite"/>
    </rect>
    <!-- Top accent line -->
    <rect width="${bw}" height="3" rx="2" fill="${n.color}" opacity="0.8"/>
    <!-- Label -->
    <text x="${bw/2}" y="28" text-anchor="middle"
          font-family="'Courier New',Courier,monospace" font-size="11" font-weight="bold"
          fill="${n.color}">${n.label}</text>
    <text x="${bw/2}" y="44" text-anchor="middle"
          font-family="'Courier New',Courier,monospace" font-size="8"
          fill="#8b949e">${n.sub}</text>
  </g>`;
  }).join('');

  // Legend: memory+network limits on Docker
  const dockerNode = getNode('docker');
  const annotationSvg = `
  <text x="${dockerNode.x}" y="${dockerNode.y + 52}" text-anchor="middle"
        font-family="'Courier New',Courier,monospace" font-size="8" fill="#8b949e">
    mem + net limits
  </text>`;

  // Title
  const titleSvg = `
  <text x="${W/2}" y="24" text-anchor="middle"
        font-family="'Courier New',Courier,monospace" font-size="13"
        fill="#e6edf3" letter-spacing="3">JUDGELY — SUBMISSION PIPELINE</text>
  <text x="${W/2}" y="40" text-anchor="middle"
        font-family="'Courier New',Courier,monospace" font-size="9"
        fill="#8b949e" letter-spacing="1">PROBLEM A · github.com/Ompatel75/Judgely · judgely-1.onrender.com</text>`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"
     role="img" aria-label="Judgely architecture diagram">
  <title>Judgely — Submission Pipeline Architecture</title>
  <defs>
    <filter id="glow">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <style>
      @media (prefers-reduced-motion: reduce) {
        animate, animateMotion { display: none; }
      }
    </style>
  </defs>
  <rect width="${W}" height="${H}" fill="#0d1117"/>
  <rect x="0" y="0" width="${W}" height="${H}" rx="0" fill="none" stroke="#30363d" stroke-width="1"/>
  ${titleSvg}
  ${edgeSvg}
  ${nodeSvg}
  ${annotationSvg}
</svg>`;

  mkdirSync('assets', { recursive: true });
  writeFileSync('assets/judgely-arch.svg', svg);
  console.log('[ARCH] Generated assets/judgely-arch.svg');
  return svg;
}

if (process.argv[1].endsWith('generate-arch.js')) {
  generateArch();
}
