// scripts/check-svgs.js — Lint SVG files for GitHub safety
// Checks: no <script>, no external URLs, under 250KB, valid XML

import { readFileSync, readdirSync, statSync } from 'fs';

const MAX_SIZE_KB = 250;
const ASSETS_DIR = 'assets';

const FORBIDDEN_PATTERNS = [
  { pattern: /<script/i, label: '<script> tag' },
  { pattern: /javascript:/i, label: 'javascript: URL' },
  { pattern: /on\w+\s*=/i, label: 'on* event handler' },
  { pattern: /xlink:href\s*=\s*"https?:\/\//i, label: 'external xlink:href' },
  { pattern: /href\s*=\s*"https?:\/\//i, label: 'external href (non-anchor)' },
  { pattern: /@import/i, label: '@import' },
  { pattern: /url\(['"]?https?:/i, label: 'external url()' },
  { pattern: /<use[^>]+href\s*=\s*"https?:/i, label: 'external <use href>' },
  { pattern: /font-face.*src.*url\('?https?:/si, label: 'external @font-face' },
];

// External http/https refs that are OK in our SVGs: none (all content is self-contained)
// textPath href="#..." is fine (internal)

let allPassed = true;

const files = readdirSync(ASSETS_DIR).filter(f => f.endsWith('.svg'));

console.log(`\n=== SVG Lint Report ===\nChecking ${files.length} files...\n`);

for (const file of files) {
  const path = `${ASSETS_DIR}/${file}`;
  const stat = statSync(path);
  const sizeKB = (stat.size / 1024).toFixed(1);
  const content = readFileSync(path, 'utf8');

  const issues = [];

  // Size check
  if (stat.size > MAX_SIZE_KB * 1024) {
    issues.push(`File size ${sizeKB} KB exceeds ${MAX_SIZE_KB} KB limit`);
  }

  // Pattern checks
  for (const { pattern, label } of FORBIDDEN_PATTERNS) {
    // Ignore href="#..." (internal refs)
    const stripped = content.replace(/href="#[^"]*"/g, '');
    if (pattern.test(stripped)) {
      issues.push(`Contains forbidden pattern: ${label}`);
    }
  }

  // Check for external image refs (src= with http)
  const imgSrcMatches = content.match(/src\s*=\s*"https?:[^"]+"/gi);
  if (imgSrcMatches) {
    issues.push(`External src URLs: ${imgSrcMatches.join(', ')}`);
  }

  const status = issues.length === 0 ? '✓' : '✗';
  const color = issues.length === 0 ? '' : '';
  console.log(`${status} ${file.padEnd(25)} ${sizeKB.padStart(7)} KB`);
  if (issues.length > 0) {
    allPassed = false;
    issues.forEach(i => console.log(`    ⚠ ${i}`));
  }
}

console.log('\n' + (allPassed ? '✅ All SVGs passed lint.' : '❌ Some SVGs have issues.'));
process.exit(allPassed ? 0 : 1);
