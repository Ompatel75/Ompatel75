// scripts/generate-snake.js — CP Snake SVG generator
// Grid: 53 columns x 7 rows = 371 days (last 52 full weeks + partial current week)
// Intensity = AC submissions per day (CF + LC + AtCoder combined)
// Snake eats cells in column-major order (like GitHub contribution graph)
// Animation: SMIL animateMotion along pre-computed path

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

const CELL_SIZE = 16;
const CELL_GAP = 3;
const CELL_RADIUS = 4;
const COLS = 53;
const ROWS = 7; // Sun=0 ... Sat=6
const GRID_W = COLS * (CELL_SIZE + CELL_GAP) - CELL_GAP;
const GRID_H = ROWS * (CELL_SIZE + CELL_GAP) - CELL_GAP;
const PAD = { top: 52, left: 32, right: 20, bottom: 40 };
const W = GRID_W + PAD.left + PAD.right;
const H = GRID_H + PAD.top + PAD.bottom;

// Violet (#7928ca) → Pink (#ff0080) intensity scale (0→max)
function intensityColor(count, maxCount, dark = true) {
  if (count === 0) return dark ? '#1c2128' : '#ebedf0';
  const t = Math.min(count / Math.max(maxCount, 1), 1);
  // Lerp from violet to pink
  const r = Math.round(0x79 + t * (0xff - 0x79));
  const g = Math.round(0x28 + t * (0x00 - 0x28));
  const b = Math.round(0xca + t * (0x80 - 0xca));
  return `rgb(${r},${g},${b})`;
}

function loadCache(path) {
  if (!existsSync(path)) return null;
  try { return JSON.parse(readFileSync(path, 'utf8')); }
  catch { return null; }
}

// Build 53×7 grid of daily AC counts
function buildGrid(cf, lc, ac, gh, includeGH = false) {
  // Start date: 364 days ago, aligned to Sunday
  const today = new Date();
  const endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);

  // Find the Sunday that is >= 364 days ago
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 363);
  // Rewind to Sunday
  const dow = startDate.getDay(); // 0=Sun
  startDate.setDate(startDate.getDate() - dow);

  // Merge daily AC maps
  const mergedAC = {};

  function merge(dailyMap) {
    if (!dailyMap) return;
    for (const [day, count] of Object.entries(dailyMap)) {
      mergedAC[day] = (mergedAC[day] || 0) + count;
    }
  }

  merge(cf?.dailyAC);
  merge(lc?.dailyAC);
  merge(ac?.dailyAC);
  if (includeGH) merge(gh?.dailyCommits);

  // Build 53×7 grid, column = week, row = day of week
  const grid = []; // grid[col][row] = {date, count}
  let d = new Date(startDate);

  for (let col = 0; col < COLS; col++) {
    grid[col] = [];
    for (let row = 0; row < ROWS; row++) {
      const dateStr = d.toISOString().slice(0, 10);
      const count = mergedAC[dateStr] || 0;
      const isFuture = d > endDate;
      grid[col][row] = { date: dateStr, count: isFuture ? -1 : count };
      d.setDate(d.getDate() + 1);
    }
  }

  return { grid, startDate, endDate };
}

// Compute snake path: snake visits cells in a serpentine pattern
// (like a snake visiting the contribution graph)
function computeSnakePath(grid) {
  const path = [];
  for (let col = 0; col < COLS; col++) {
    if (col % 2 === 0) {
      for (let row = 0; row < ROWS; row++) {
        if (grid[col][row].count >= 0) path.push({ col, row });
      }
    } else {
      for (let row = ROWS - 1; row >= 0; row--) {
        if (grid[col][row].count >= 0) path.push({ col, row });
      }
    }
  }
  return path;
}

// Convert grid position to SVG coordinates (cell center)
function cellCenter(col, row) {
  const x = PAD.left + col * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
  const y = PAD.top + row * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
  return { x, y };
}

export function generateSnake(dark = true) {
  const cf = loadCache('data/cache/cf.json');
  const lc = loadCache('data/cache/lc.json');
  const ac = loadCache('data/cache/ac.json');
  const gh = loadCache('data/cache/gh.json');

  const { grid, startDate, endDate } = buildGrid(cf, lc, ac, gh, false);

  // Find max intensity
  let maxCount = 1;
  for (const col of grid) {
    for (const cell of col) {
      if (cell.count > maxCount) maxCount = cell.count;
    }
  }

  // Total ACs eaten
  let totalAC = 0;
  for (const col of grid) {
    for (const cell of col) {
      if (cell.count > 0) totalAC += cell.count;
    }
  }

  // Snake path (ordered list of cells the snake visits)
  const snakePath = computeSnakePath(grid);

  // Build motion path for the snake head
  const motionPathPoints = snakePath.map(({ col, row }) => {
    const { x, y } = cellCenter(col, row);
    return `${x},${y}`;
  });
  // Create an SVG path from the motion points
  const motionD = 'M ' + snakePath.map(({ col, row }) => {
    const { x, y } = cellCenter(col, row);
    return `${x} ${y}`;
  }).join(' L ');

  const bg = dark ? '#0d1117' : '#ffffff';
  const textCol = dark ? '#8b949e' : '#666';
  const borderCol = dark ? '#30363d' : '#d0d7de';
  const emptyCol = dark ? '#1c2128' : '#ebedf0';
  const surfaceCol = dark ? '#161b22' : '#f6f8fa';

  // Month labels
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthLabels = [];
  let prevMonth = -1;
  for (let col = 0; col < COLS; col++) {
    const d = grid[col][0];
    if (!d || d.count < 0) continue;
    const m = parseInt(d.date.slice(5, 7)) - 1;
    if (m !== prevMonth) {
      monthLabels.push({ col, month: monthNames[m] });
      prevMonth = m;
    }
  }

  // Day labels
  const dayLabels = ['Sun', 'Tue', 'Thu', 'Sat'];
  const dayRows = [0, 2, 4, 6];

  // Build cell rectangles
  let cellsSvg = '';
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const cell = grid[col][row];
      if (cell.count < 0) continue; // future
      const x = PAD.left + col * (CELL_SIZE + CELL_GAP);
      const y = PAD.top + row * (CELL_SIZE + CELL_GAP);
      const color = intensityColor(cell.count, maxCount, dark);
      const cellId = `c_${col}_${row}`;

      // Cells start visible, then the snake "eats" them (they light up)
      cellsSvg += `
  <rect id="${cellId}" x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}"
        rx="${CELL_RADIUS}" fill="${color}">
    <title>${cell.date}: ${cell.count} ACs</title>
  </rect>`;
    }
  }

  // Snake: animated head + glowing trail
  // The snake head follows the motionD path
  // Tail segments follow with offset timing
  const SNAKE_LEN = 8; // visible tail cells
  const ANIM_DUR = 18; // seconds for full loop
  const cellCount = snakePath.length;

  // Build keyTimes and keyPoints for head motion
  // Each cell = uniform time segment
  const keyTimes = snakePath.map((_, i) => (i / (cellCount - 1)).toFixed(4)).join(';');
  const keyPoints = snakePath.map((_, i) => (i / (cellCount - 1)).toFixed(4)).join(';');

  // Snake trail: 8 trail dots following the head with delay
  let snakeTrailSvg = '';
  for (let t = SNAKE_LEN; t >= 1; t--) {
    const alpha = t / SNAKE_LEN;
    const r = 4 + (SNAKE_LEN - t) * 0.5;
    const trailColor = t === SNAKE_LEN ? '#00dfd8' : '#ff0080';
    const delayFrac = (t / cellCount) * ANIM_DUR;

    snakeTrailSvg += `
  <circle r="${r}" fill="${trailColor}" opacity="${alpha * 0.9}">
    <filter id="trailGlow${t}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${3 - t * 0.2}" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <animateMotion dur="${ANIM_DUR}s" begin="-${delayFrac.toFixed(2)}s" repeatCount="indefinite"
                   calcMode="linear" keyTimes="${keyTimes}" keyPoints="${keyPoints}">
      <mpath href="#snakeMotionPath"/>
    </animateMotion>
  </circle>`;
  }

  // Snake head (eyes)
  const snakeHeadSvg = `
  <!-- Snake head -->
  <g id="snakeHead">
    <animateMotion dur="${ANIM_DUR}s" repeatCount="indefinite"
                   calcMode="linear" keyTimes="${keyTimes}" keyPoints="${keyPoints}">
      <mpath href="#snakeMotionPath"/>
    </animateMotion>
    <circle r="8" fill="#00dfd8">
      <filter id="headGlow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </circle>
    <!-- Eyes -->
    <circle cx="-2" cy="-3" r="2" fill="#0d1117"/>
    <circle cx="2" cy="-3" r="2" fill="#0d1117"/>
    <circle cx="-1.5" cy="-3.2" r="0.8" fill="#ffffff"/>
    <circle cx="2.5" cy="-3.2" r="0.8" fill="#ffffff"/>
  </g>`;

  // Glow filter for head
  const headGlowDef = `
    <filter id="headGlowFilt" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`;

  // Counter label
  const counterSvg = `
  <!-- AC counter -->
  <text x="${W/2}" y="${H - 8}" text-anchor="middle"
        font-family="'Courier New',Courier,monospace" font-size="11" fill="${textCol}">
    ACs eaten: ${totalAC.toLocaleString()} · Sources: Codeforces + LeetCode + AtCoder · last 52 weeks
  </text>`;

  // Month and day labels
  const monthSvg = monthLabels.map(m =>
    `<text x="${PAD.left + m.col * (CELL_SIZE + CELL_GAP)}" y="${PAD.top - 8}"
           font-family="'Courier New',Courier,monospace" font-size="9" fill="${textCol}">${m.month}</text>`
  ).join('\n  ');

  const daySvg = dayLabels.map((d, i) =>
    `<text x="${PAD.left - 6}" y="${PAD.top + dayRows[i] * (CELL_SIZE + CELL_GAP) + 12}"
           text-anchor="end" font-family="'Courier New',Courier,monospace" font-size="8"
           fill="${textCol}">${d}</text>`
  ).join('\n  ');

  // Legend
  const legendSvg = `
  <text x="${PAD.left}" y="${H - 22}" font-family="'Courier New',Courier,monospace"
        font-size="9" fill="${textCol}">Less</text>
  ${[0, 1, 2, 3, 4].map(i => `
  <rect x="${PAD.left + 36 + i * (CELL_SIZE + 2)}" y="${H - 32}" width="${CELL_SIZE}" height="${CELL_SIZE}"
        rx="${CELL_RADIUS}" fill="${intensityColor(i * Math.ceil(maxCount/4), maxCount, dark)}"/>`).join('')}
  <text x="${PAD.left + 36 + 5 * (CELL_SIZE + 2) + 4}" y="${H - 22}"
        font-family="'Courier New',Courier,monospace" font-size="9" fill="${textCol}">More</text>`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"
     role="img" aria-label="CP Snake eating accepted submissions">
  <title>CP Snake — Om Patel's CP Activity</title>
  <defs>
    ${headGlowDef}
    <style>
      @media (prefers-reduced-motion: reduce) {
        animateMotion, animate { display: none; }
      }
    </style>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="${bg}"/>
  <rect x="1" y="1" width="${W-2}" height="${H-2}" fill="none" stroke="${borderCol}" stroke-width="1"/>

  <!-- Month labels -->
  ${monthSvg}
  <!-- Day labels -->
  ${daySvg}

  <!-- Grid cells -->
  ${cellsSvg}

  <!-- Hidden motion path for snake -->
  <path id="snakeMotionPath" d="${motionD}" fill="none" stroke="none" visibility="hidden"/>

  <!-- Snake trail (back to front) -->
  ${snakeTrailSvg}

  <!-- Snake head -->
  ${snakeHeadSvg}

  <!-- Legend -->
  ${legendSvg}

  <!-- Counter -->
  ${counterSvg}
</svg>`;

  mkdirSync('assets', { recursive: true });
  const filename = dark ? 'assets/snake.svg' : 'assets/snake-light.svg';
  writeFileSync(filename, svg);
  console.log(`[SNAKE] Generated ${filename} (${totalAC} total ACs, max ${maxCount}/day)`);
  return svg;
}

export function generateSnakeBoth() {
  generateSnake(true);
  generateSnake(false);
}

if (process.argv[1].endsWith('generate-snake.js')) {
  generateSnakeBoth();
}

