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
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080"); // You can specify your frontend URL here instead of "*"
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle OPTIONS request (preflight request) for CORS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Manga ID is required" });
  }

  const cacheKey = `manga-${id}`;
  const cachedData = getCachedData(cacheKey);

  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const response = await axios.get(`${MANGADX_API_URL}/manga/${id}`);
    const mangaData = response.data.data.attributes;

    const manga = {
      id: response.data.data.id,
      title: mangaData.title,
      description: mangaData.description,
    };

    setCachedData(cacheKey, manga);
    return res.json(manga);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
