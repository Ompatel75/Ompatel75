// scripts/fetch-gh.js — GitHub GraphQL fetcher

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

const CACHE_PATH = 'data/cache/gh.json';
const USERNAME = 'Ompatel75';

async function gql(query, token) {
  const fetch = (await import('node-fetch')).default;
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'github-profile-generator/1.0',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({ query }),
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

export async function fetchGH() {
  const cache = loadCache();
  const token = process.env.GITHUB_TOKEN;

  try {
    console.log('[GH] Fetching GitHub stats...');

    const data = await gql(`
      query {
        user(login: "${USERNAME}") {
          name
          bio
          followers { totalCount }
          following { totalCount }
          repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC) {
            totalCount
            nodes {
              name
              stargazerCount
              forkCount
              primaryLanguage { name color }
              description
              updatedAt
            }
          }
          contributionsCollection {
            totalCommitContributions
            totalPullRequestContributions
            totalIssueContributions
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }
    `, token);

    const user = data.user;
    const repos = user.repositories.nodes;

    // Top repos by stars
    const topRepos = [...repos]
      .sort((a, b) => b.stargazerCount - a.stargazerCount)
      .slice(0, 6);

    // Language breakdown
    const langMap = {};
    for (const repo of repos) {
      if (repo.primaryLanguage) {
        langMap[repo.primaryLanguage.name] = (langMap[repo.primaryLanguage.name] || 0) + 1;
      }
    }

    // Daily contribution map
    const dailyCommits = {};
    for (const week of user.contributionsCollection.contributionCalendar.weeks) {
      for (const day of week.contributionDays) {
        if (day.contributionCount > 0) {
          dailyCommits[day.date] = day.contributionCount;
        }
      }
    }

    const result = {
      fetchedAt: new Date().toISOString(),
      totalRepos: user.repositories.totalCount,
      followers: user.followers.totalCount,
      following: user.following.totalCount,
      totalCommits: user.contributionsCollection.totalCommitContributions,
      totalPRs: user.contributionsCollection.totalPullRequestContributions,
      totalIssues: user.contributionsCollection.totalIssueContributions,
      totalContributions: user.contributionsCollection.contributionCalendar.totalContributions,
      totalStars: repos.reduce((s, r) => s + r.stargazerCount, 0),
      topRepos,
      languages: langMap,
      dailyCommits,
    };

    saveCache(result);
    console.log(`[GH] Done. Repos: ${result.totalRepos}, Stars: ${result.totalStars}`);
    return result;
  } catch (err) {
    console.error(`[GH] Fetch failed: ${err.message}. Using cache.`);
    if (cache) return cache;
    // Return minimal skeleton if no cache
    return {
      fetchedAt: null,
      totalRepos: 0, followers: 0, following: 0,
      totalCommits: 0, totalPRs: 0, totalIssues: 0,
      totalContributions: 0, totalStars: 0,
      topRepos: [], languages: {}, dailyCommits: {},
    };
  }
}

if (process.argv[1].endsWith('fetch-gh.js')) {
  fetchGH().catch(e => { console.error(e); process.exit(1); });
}
