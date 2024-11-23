import axios from "axios";
import NodeCache from "node-cache";
import cors from "cors";

const cache = new NodeCache({ stdTTL: process.env.CACHE_TTL || 600, checkperiod: 300 });
const MANGADX_API_URL = process.env.MANGADX_API_URL || "https://api.mangadex.org";

const handler = async (req, res) => {
  cors()(req, res, async () => {
    const query = req.query.query || "";

    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    const cacheKey = `search-${query}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    }

    try {
      const response = await axios.get(`${MANGADX_API_URL}/manga`, { params: { title: query } });

      const mangaList = response.data.data.map((manga) => ({
        id: manga.id,
        title: manga.attributes.title,
        description: manga.attributes.description,
        status: manga.attributes.status,
        year: manga.attributes.year,
      }));

      cache.set(cacheKey, mangaList);
      return res.json(mangaList);
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
};

export default handler;
