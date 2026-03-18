/**
 * GBIF (Global Biodiversity Information Facility) API service.
 *
 * The GBIF API is a free, open API that provides access to hundreds of
 * millions of biodiversity occurrence records and a comprehensive species
 * checklist derived from the GBIF Backbone Taxonomy.
 *
 * API documentation: https://www.gbif.org/developer/summary
 * No authentication is required for read-only requests.
 */

const https = require('https');

const GBIF_BASE = 'https://api.gbif.org/v1';

const GBIF_REQUEST_TIMEOUT_MS = 8000; // 8 seconds — enough for most GBIF responses while avoiding indefinite hangs

/**
 * Make an HTTPS GET request and resolve with the parsed JSON body.
 * @param {string} url
 * @returns {Promise<object>}
 */
function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: GBIF_REQUEST_TIMEOUT_MS }, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(raw));
        } catch (err) {
          reject(new Error(`GBIF response parse error: ${err.message}`));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy(new Error('GBIF request timed out'));
    });
  });
}

/**
 * Search the GBIF species checklist for plants matching the given query.
 *
 * @param {string} query  - Common or scientific name to search for.
 * @param {number} [limit=5] - Maximum number of results to return.
 * @returns {Promise<Array<{
 *   key: number,
 *   scientificName: string,
 *   canonicalName: string,
 *   family: string|undefined,
 *   genus: string|undefined,
 *   kingdom: string|undefined,
 *   rank: string|undefined,
 *   status: string|undefined
 * }>>}
 */
async function searchSpecies(query, limit = 5) {
  const url =
    `${GBIF_BASE}/species/search` +
    `?q=${encodeURIComponent(query)}` +
    `&kingdom=Plantae` +
    `&rank=SPECIES` +
    `&limit=${limit}`;

  const data = await get(url);

  return (data.results || []).map((r) => ({
    key: r.key,
    scientificName: r.scientificName || '',
    canonicalName: r.canonicalName || '',
    family: r.family || null,
    genus: r.genus || null,
    kingdom: r.kingdom || 'Plantae',
    rank: r.rank || null,
    status: r.taxonomicStatus || null,
  }));
}

/**
 * Retrieve detailed information about a single species by its GBIF usage key.
 *
 * @param {number|string} key - GBIF species usage key.
 * @returns {Promise<{
 *   key: number,
 *   scientificName: string,
 *   canonicalName: string,
 *   authorship: string|undefined,
 *   family: string|undefined,
 *   genus: string|undefined,
 *   kingdom: string|undefined,
 *   phylum: string|undefined,
 *   class: string|undefined,
 *   order: string|undefined,
 *   rank: string|undefined,
 *   status: string|undefined,
 *   publishedIn: string|undefined
 * }>}
 */
async function getSpeciesInfo(key) {
  const url = `${GBIF_BASE}/species/${encodeURIComponent(String(key))}`;
  const data = await get(url);

  return {
    key: data.key,
    scientificName: data.scientificName || '',
    canonicalName: data.canonicalName || '',
    authorship: data.authorship || null,
    family: data.family || null,
    genus: data.genus || null,
    kingdom: data.kingdom || null,
    phylum: data.phylum || null,
    class: data.class || null,
    order: data.order || null,
    rank: data.rank || null,
    status: data.taxonomicStatus || null,
    publishedIn: data.publishedIn || null,
  };
}

module.exports = { searchSpecies, getSpeciesInfo };
