// scripts/fetch-ac.js — AtCoder fetcher via atcoder-problems.info API

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

const CACHE_PATH = 'data/cache/ac.json';
const HANDLE = 'Om_patel07';

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

export async function fetchAC() {
  const cache = loadCache();
  try {
    console.log('[AC] Fetching AtCoder data...');

    // Rating history from AtCoder Problems
    const [ratingHistory, submissions] = await Promise.all([
      fetchJSON(`https://atcoder.jp/users/${HANDLE}/history/json`),
      fetchJSON(`https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${HANDLE}&from_second=0`),
    ]);

    // Build daily AC map for last 12 months
    const cutoff = Date.now() / 1000 - 365 * 86400;
    const dailyAC = {};
    const solvedSet = new Set();

    for (const sub of submissions) {
      if (sub.result === 'AC') {
        solvedSet.add(sub.problem_id);
        if (sub.epoch_second >= cutoff) {
          const day = new Date(sub.epoch_second * 1000).toISOString().slice(0, 10);
          dailyAC[day] = (dailyAC[day] || 0) + 1;
        }
      }
    }

    // Latest rating from history
    const currentRating = ratingHistory.length > 0
      ? ratingHistory[ratingHistory.length - 1].NewRating
      : 0;

    const data = {
      fetchedAt: new Date().toISOString(),
      handle: HANDLE,
      rating: currentRating,
      ratingHistory: ratingHistory.map(r => ({
        date: r.EndTime.slice(0, 10),
        rating: r.NewRating,
        contestName: r.ContestScreenName || '',
        rank: r.Place,
      })),
      solvedCount: solvedSet.size,
      dailyAC,
    };

    saveCache(data);
    console.log(`[AC] Done. Rating: ${data.rating}, Solved: ${data.solvedCount}`);
    return data;
  } catch (err) {
    console.error(`[AC] Fetch failed: ${err.message}. Using cache.`);
    if (cache) return cache;
    throw new Error('[AC] No cache available and fetch failed');
  }
}

if (process.argv[1].endsWith('fetch-ac.js')) {
  fetchAC().catch(e => { console.error(e); process.exit(1); });
}
