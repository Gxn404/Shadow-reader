<<<<<<< HEAD
import axios from "axios";
import NodeCache from "node-cache";
import cors from "cors";

const cache = new NodeCache({ stdTTL: process.env.CACHE_TTL || 600, checkperiod: 300 });
const MANGADX_API_URL = process.env.MANGADX_API_URL || "https://api.mangadex.org";

const handler = async (req, res) => {
  cors()(req, res, async () => {
    const mangaId = req.query.id;

    if (!mangaId) {
      return res.status(400).json({ error: "Manga ID is required" });
    }

    const cacheKey = `manga-${mangaId}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    }

    try {
      const response = await axios.get(`${MANGADX_API_URL}/manga/${mangaId}`);
      const mangaData = response.data.data.attributes;

      const manga = {
        id: response.data.data.id,
        title: mangaData.title,
        description: mangaData.description,
        status: mangaData.status,
        year: mangaData.year,
        genres: mangaData.tags,
      };

      cache.set(cacheKey, manga);
      return res.json(manga);
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
};

export default handler;
=======
import axios from "axios";
import NodeCache from "node-cache";
import cors from "cors";

const cache = new NodeCache({ stdTTL: process.env.CACHE_TTL || 600, checkperiod: 300 });
const MANGADX_API_URL = process.env.MANGADX_API_URL || "https://api.mangadex.org";

const handler = async (req, res) => {
  cors()(req, res, async () => {
    const mangaId = req.query.id;

    if (!mangaId) {
      return res.status(400).json({ error: "Manga ID is required" });
    }

    const cacheKey = `manga-${mangaId}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    }

    try {
      const response = await axios.get(`${MANGADX_API_URL}/manga/${mangaId}`);
      const mangaData = response.data.data.attributes;

      const manga = {
        id: response.data.data.id,
        title: mangaData.title,
        description: mangaData.description,
        status: mangaData.status,
        year: mangaData.year,
        genres: mangaData.tags,
      };

      cache.set(cacheKey, manga);
      return res.json(manga);
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
};

export default handler;
>>>>>>> 1f0d6e76c56170febf855ad016dcaeb4bea37b11
