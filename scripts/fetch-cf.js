// scripts/fetch-cf.js — Codeforces API fetcher
// Fetches: user.info, user.rating (history), user.status (submissions)

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const CACHE_PATH = 'data/cache/cf.json';
const HANDLE = 'Omm_Patel';

async function fetchJSON(url) {
  const fetch = (await import('node-fetch')).default;
  const res = await fetch(url, { headers: { 'User-Agent': 'github-profile-generator/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

function loadCache() {
  if (existsSync(CACHE_PATH)) {
    try { return JSON.parse(readFileSync(CACHE_PATH, 'utf8')); }
    catch { return null; }
  }
  return null;
}

function saveCache(data) {
  mkdirSync('data/cache', { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2));
}

export async function fetchCF() {
  const cache = loadCache();
  try {
    console.log('[CF] Fetching user info...');
    const [infoRes, ratingRes, statusRes] = await Promise.all([
      fetchJSON(`https://codeforces.com/api/user.info?handles=${HANDLE}`),
      fetchJSON(`https://codeforces.com/api/user.rating?handle=${HANDLE}`),
      fetchJSON(`https://codeforces.com/api/user.status?handle=${HANDLE}&from=1&count=10000`),
    ]);

    if (infoRes.status !== 'OK') throw new Error('CF user.info failed');
    if (ratingRes.status !== 'OK') throw new Error('CF user.rating failed');
    if (statusRes.status !== 'OK') throw new Error('CF user.status failed');

    const info = infoRes.result[0];
    const ratingHistory = ratingRes.result; // [{contestId, contestName, rank, oldRating, newRating, ratingUpdateTimeSeconds}]
    const submissions = statusRes.result;   // full submission list

    // Build daily AC map for last 12 months
    const cutoff = Date.now() / 1000 - 365 * 86400;
    const dailyAC = {};
    for (const sub of submissions) {
      if (sub.verdict === 'OK' && sub.creationTimeSeconds >= cutoff) {
        const day = new Date(sub.creationTimeSeconds * 1000).toISOString().slice(0, 10);
        dailyAC[day] = (dailyAC[day] || 0) + 1;
      }
    }

    // Total solved (unique problems with AC)
    const solvedSet = new Set();
    for (const sub of submissions) {
      if (sub.verdict === 'OK') {
        solvedSet.add(`${sub.problem.contestId}-${sub.problem.index}`);
      }
    }

    const data = {
      fetchedAt: new Date().toISOString(),
      handle: info.handle,
      rating: info.rating || 0,
      maxRating: info.maxRating || 0,
      rank: info.rank || 'unrated',
      maxRank: info.maxRank || 'unrated',
      contribution: info.contribution || 0,
      solvedCount: solvedSet.size,
      ratingHistory: ratingHistory.map(r => ({
        date: new Date(r.ratingUpdateTimeSeconds * 1000).toISOString().slice(0, 10),
        rating: r.newRating,
        contestName: r.contestName,
        rank: r.rank,
      })),
      dailyAC,
    };

    saveCache(data);
    console.log(`[CF] Done. Rating: ${data.rating}, Solved: ${data.solvedCount}`);
    return data;
  } catch (err) {
    console.error(`[CF] Fetch failed: ${err.message}. Using cache.`);
    if (cache) return cache;
    throw new Error('[CF] No cache available and fetch failed');
  }
}

// Allow direct execution
if (process.argv[1].endsWith('fetch-cf.js')) {
  fetchCF().catch(e => { console.error(e); process.exit(1); });
}
