import axios from "axios";
import NodeCache from "node-cache";
import dotenv from "dotenv";

dotenv.config();

const CACHE_TTL = process.env.CACHE_TTL || 600; // Cache TTL in seconds
const MANGADX_API_URL = process.env.MANGADX_API_URL || "https://api.mangadex.org";

const cache = new NodeCache({ stdTTL: CACHE_TTL, checkperiod: CACHE_TTL / 2 });

const getCachedData = (key) => cache.get(key);
const setCachedData = (key, data) => cache.set(key, data);

const fetchMangaDetails = async (id) => {
  const response = await axios.get(`${MANGADX_API_URL}/manga/${id}`);
  const mangaData = response.data.data.attributes;
  return {
    id: response.data.data.id,
    title: mangaData.title?.en || "Title not available",
    description: mangaData.description?.en || "Description not available",
    status: mangaData.status,
    year: mangaData.year,
    genres: mangaData.tags?.map((tag) => tag.attributes?.name?.en) || [],
  };
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "http://localhost:8080");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Manga ID is required." });
  }

  const cacheKey = `manga-${id}`;
  const cachedData = getCachedData(cacheKey);

  if (cachedData) {
    console.log("[CACHE] Returning cached manga details.");
    return res.status(200).json(cachedData);
  }

  try {
    const manga = await fetchMangaDetails(id);
    setCachedData(cacheKey, manga);
    return res.status(200).json(manga);
  } catch (error) {
    console.error(`[ERROR] Failed to fetch manga ID ${id}:`, error.message);

    if (error.response) {
      return res
        .status(error.response.status)
        .json({ error: error.response.data.message || "Failed to fetch manga." });
    } else {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

