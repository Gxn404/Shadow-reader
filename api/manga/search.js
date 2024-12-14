import axios from "axios";
import NodeCache from "node-cache";
import dotenv from "dotenv";

dotenv.config();

const CACHE_TTL = process.env.CACHE_TTL || 600; // Cache TTL in seconds
const MANGADX_API_URL = process.env.MANGADX_API_URL || "https://api.mangadex.org";

const cache = new NodeCache({ stdTTL: CACHE_TTL, checkperiod: CACHE_TTL / 2 });

const getCachedData = (key) => cache.get(key);
const setCachedData = (key, data) => cache.set(key, data);

export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  const cacheKey = `search-${query}`;
  const cachedData = getCachedData(cacheKey);

  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const response = await axios.get(`${MANGADX_API_URL}/manga`, {
      params: { title: query },
    });

    const mangaList = response.data.data.map((manga) => ({
      id: manga.id,
      title: manga.attributes.title,
      description: manga.attributes.description,
    }));

    setCachedData(cacheKey, mangaList);
    return res.json(mangaList);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}