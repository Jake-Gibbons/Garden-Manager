const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const summaryCache = new Map();

async function fetchWikipediaSummary(query) {
  const normalizedQuery = String(query || '').trim();
  if (!normalizedQuery) {
    throw new Error('Query is required');
  }

  const cached = summaryCache.get(normalizedQuery.toLowerCase());
  if (cached && cached.expiresAt > Date.now()) {
    return { summary: cached.summary, cached: true };
  }

  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&format=json&redirects=1&origin=*&titles=${encodeURIComponent(normalizedQuery)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Could not reach Wikipedia API');
  }

  const data = await response.json();
  const pages = data.query && data.query.pages ? Object.values(data.query.pages) : [];
  if (!pages.length || pages[0].missing) {
    throw new Error('No summary found for this plant right now');
  }

  const summary = pages[0].extract || 'No summary text returned by Wikipedia.';
  summaryCache.set(normalizedQuery.toLowerCase(), {
    summary,
    expiresAt: Date.now() + CACHE_TTL_MS
  });

  return { summary, cached: false };
}

function clearSummaryCache() {
  summaryCache.clear();
}

module.exports = {
  fetchWikipediaSummary,
  clearSummaryCache
};