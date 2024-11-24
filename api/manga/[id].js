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
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080"); // Change this to your frontend URL in production
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle OPTIONS (CORS preflight request)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Ensure the method is GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Manga ID is required." });
  }

  const cacheKey = `manga-${id}`;
  const cachedData = getCachedData(cacheKey);

  // Serve cached data if available
  if (cachedData) {
    console.log("[CACHE] Returning cached manga details.");
    return res.status(200).json(cachedData);
  }

  try {
    // Fetch manga details from the MangaDex API
    const response = await axios.get(`${MANGADX_API_URL}/manga/${id}`);
    const mangaData = response.data.data.attributes;

    // Structure the manga details
    const manga = {
      id: response.data.data.id,
      title: mangaData.title?.en || "Title not available",
      description: mangaData.description?.en || "Description not available",
      status: mangaData.status,
      year: mangaData.year,
      genres: mangaData.tags?.map((tag) => tag.attributes?.name?.en) || [],
    };

    // Cache the response
    setCachedData(cacheKey, manga);

    // Respond with the manga details
    return res.status(200).json(manga);
  } catch (error) {
    console.error(`[ERROR] Failed to fetch manga ID ${id}:`, error.message);

    // Handle known errors or return a general error message
    if (error.response) {
      return res
        .status(error.response.status)
        .json({ error: error.response.data.message || "Failed to fetch manga." });
    } else {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
