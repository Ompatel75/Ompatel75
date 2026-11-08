// scripts/fetch-lc.js — LeetCode GraphQL fetcher (unofficial public API)

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

const CACHE_PATH = 'data/cache/lc.json';
const HANDLE = 'om_patel11';
const GRAPHQL_URL = 'https://leetcode.com/graphql';

async function gql(query, variables = {}) {
  const fetch = (await import('node-fetch')).default;
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'github-profile-generator/1.0',
      'Referer': 'https://leetcode.com',
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
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

export async function fetchLC() {
  const cache = loadCache();
  try {
    console.log('[LC] Fetching user stats...');

    // User profile + solved stats
    const profileData = await gql(`
      query userPublicProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile { ranking starRating }
          submitStats {
            acSubmissionNum { difficulty count submissions }
          }
          badges { name }
        }
      }
    `, { username: HANDLE });

    if (!profileData.matchedUser) throw new Error('User not found');
    const user = profileData.matchedUser;

    // Submission calendar (last year of daily submissions)
    const calendarData = await gql(`
      query userProfileCalendar($username: String!, $year: Int) {
        matchedUser(username: $username) {
          userCalendar(year: $year) {
            submissionCalendar
            totalActiveDays
            streak
          }
        }
      }
    `, { username: HANDLE, year: new Date().getFullYear() });

    // Contest ranking history
    let contestHistory = [];
    try {
      const contestData = await gql(`
        query userContestRankingInfo($username: String!) {
          userContestRanking(username: $username) {
            attendedContestsCount
            rating
            globalRanking
            badge { name }
          }
          userContestRankingHistory(username: $username) {
            attended
            rating
            ranking
            contest { title startTime }
          }
        }
      `, { username: HANDLE });
      if (contestData.userContestRankingHistory) {
        contestHistory = contestData.userContestRankingHistory
          .filter(c => c.attended)
          .map(c => ({
            date: new Date(c.contest.startTime * 1000).toISOString().slice(0, 10),
            rating: Math.round(c.rating),
            rank: c.ranking,
            contest: c.contest.title,
          }));
      }
    } catch (e) {
      console.warn('[LC] Contest history fetch failed:', e.message);
    }

    const acStats = user.submitStats.acSubmissionNum;
    const totalAC = acStats.find(s => s.difficulty === 'All')?.count || 0;
    const easyAC = acStats.find(s => s.difficulty === 'Easy')?.count || 0;
    const mediumAC = acStats.find(s => s.difficulty === 'Medium')?.count || 0;
    const hardAC = acStats.find(s => s.difficulty === 'Hard')?.count || 0;

    // Parse submission calendar (unix timestamps → counts)
    let rawCalendar = {};
    try {
      const calUser = calendarData.matchedUser;
      rawCalendar = JSON.parse(calUser?.userCalendar?.submissionCalendar || '{}');
    } catch { /* ignore */ }

    // Build daily AC map (approximation: use submission calendar)
    const cutoff = Math.floor(Date.now() / 1000) - 365 * 86400;
    const dailyAC = {};
    for (const [ts, count] of Object.entries(rawCalendar)) {
      if (parseInt(ts) >= cutoff) {
        const day = new Date(parseInt(ts) * 1000).toISOString().slice(0, 10);
        dailyAC[day] = count;
      }
    }

    const data = {
      fetchedAt: new Date().toISOString(),
      handle: user.username,
      ranking: user.profile.ranking,
      totalSolved: totalAC,
      easySolved: easyAC,
      mediumSolved: mediumAC,
      hardSolved: hardAC,
      badge: user.badges?.[0]?.name || 'Knight',
      contestHistory,
      currentContestRating: contestHistory.length > 0
        ? contestHistory[contestHistory.length - 1].rating
        : null,
      dailyAC,
    };

    saveCache(data);
    console.log(`[LC] Done. Solved: ${totalAC}, Contest rating: ${data.currentContestRating}`);
    return data;
  } catch (err) {
    console.error(`[LC] Fetch failed: ${err.message}. Using cache.`);
    if (cache) return cache;
    throw new Error('[LC] No cache available and fetch failed');
  }
}

if (process.argv[1].endsWith('fetch-lc.js')) {
  fetchLC().catch(e => { console.error(e); process.exit(1); });
}

