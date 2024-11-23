import axios from "axios";
import NodeCache from "node-cache";
import dotenv from "dotenv";

dotenv.config();

const CACHE_TTL = process.env.CACHE_TTL || 600; // Cache TTL in seconds
const MANGADX_API_URL = process.env.MANGADX_API_URL || "https://api.mangadex.org";

// Initialize cache
const cache = new NodeCache({ stdTTL: CACHE_TTL, checkperiod: CACHE_TTL / 2 });

const getCachedData = (key) => cache.get(key);
const setCachedData = (key, data) => cache.set(key, data);

export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  const cacheKey = `manga-query-${query}`;
  const cachedData = getCachedData(cacheKey);

  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const searchResponse = await axios.get(`${MANGADX_API_URL}/manga`, {
      params: { title: query },
    });

    if (!searchResponse.data?.data?.length) {
      return res.status(404).json({ error: "No manga found for the given query" });
    }

    const mangaIds = searchResponse.data.data.map((manga) => manga.id);

    const mangaDetailsPromises = mangaIds.map(async (id) => {
      try {
        const response = await axios.get(`${MANGADX_API_URL}/manga/${id}`);
        const attributes = response.data.data.attributes;
        return {
          id,
          title: attributes.title,
          description: attributes.description,
        };
      } catch {
        return null;
      }
    });

    const mangaDetails = (await Promise.all(mangaDetailsPromises)).filter(Boolean);
    setCachedData(cacheKey, mangaDetails);

    return res.json(mangaDetails);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
