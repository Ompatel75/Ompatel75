// scripts/build-all.js — Orchestrator: fetch data, generate all assets

import { fetchCF } from './fetch-cf.js';
import { fetchLC } from './fetch-lc.js';
import { fetchAC } from './fetch-ac.js';
import { fetchGH } from './fetch-gh.js';
import { generateHero } from './generate-hero.js';
import { generateDivider } from './generate-divider.js';
import { generateGraphs } from './generate-graphs.js';
import { generateStandings } from './generate-standings.js';
import { generateStack } from './generate-stack.js';
import { generateArch } from './generate-arch.js';
import { generateSnakeBoth } from './generate-snake.js';
import { generateGHStats } from './generate-gh-stats.js';

const args = process.argv.slice(2);
const fetchOnly = args.includes('--fetch-only');
const generateOnly = args.includes('--generate-only');

async function safeFetch(name, fn) {
  try {
    const result = await fn();
    console.log(`✓ ${name}`);
    return result;
  } catch (e) {
    console.error(`✗ ${name}: ${e.message}`);
    return null;
  }
}

function safeGenerate(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (e) {
    console.error(`✗ ${name}: ${e.message}`);
  }
}

async function main() {
  console.log('\n=== PHASE 1: Data fetch ===');

  if (!generateOnly) {
    await Promise.all([
      safeFetch('Codeforces', fetchCF),
      safeFetch('LeetCode', fetchLC),
      safeFetch('AtCoder', fetchAC),
      safeFetch('GitHub', fetchGH),
    ]);
  }

  if (!fetchOnly) {
    console.log('\n=== PHASE 2: Asset generation ===');
    safeGenerate('Hero banner', generateHero);
    safeGenerate('Divider', generateDivider);
    safeGenerate('Rating graphs', generateGraphs);
    safeGenerate('Standings', generateStandings);
    safeGenerate('Stack orbit', generateStack);
    safeGenerate('Judgely arch', generateArch);
    safeGenerate('CP Snake (dark)', () => generateSnakeBoth());
    safeGenerate('GitHub stats', generateGHStats);

    console.log('\n=== Done ===');
    console.log('Assets written to assets/');
    console.log('Run: check-svgs.js to lint sizes and validate');
  }
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});

