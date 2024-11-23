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
        const relationships = response.data.data.relationships || [];

        let coverUrl = "default-cover.jpg"; // Default cover

        const coverArtRelationship = relationships.find((rel) => rel.type === "cover_art");
        if (coverArtRelationship) {
          const coverResponse = await axios.get(`${MANGADX_API_URL}/cover/${coverArtRelationship.id}`);
          const filename = coverResponse.data.data.attributes.fileName;
          coverUrl = `https://uploads.mangadex.org/covers/${id}/${filename}`;
        }

        return {
          id,
          title: attributes.title,
          description: attributes.description,
          cover: coverUrl, // Add the cover URL to the details
          status: attributes.status,
          year: attributes.year,
          genres: attributes.tags.filter((tag) => tag.attributes.group === "genre")
            .map((tag) => tag.attributes.name.en),
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
