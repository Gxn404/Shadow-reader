<<<<<<< HEAD
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

    const cacheKey = `manga-query-${query}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    }

    try {
      const searchResponse = await axios.get(`${MANGADX_API_URL}/manga`, { params: { title: query } });

      if (!searchResponse.data?.data?.length) {
        return res.status(404).json({ error: "No manga found for the given query" });
      }

      const mangaIds = searchResponse.data.data.map((manga) => manga.id);

      const mangaDetailsPromises = mangaIds.map(async (mangaId) => {
        try {
          const mangaDetailsResponse = await axios.get(`${MANGADX_API_URL}/manga/${mangaId}`);
          const attributes = mangaDetailsResponse.data.data.attributes;
          const relationships = mangaDetailsResponse.data.data.relationships || [];

          const coverArtRelationship = relationships.find((rel) => rel.type === "cover_art");
          let coverUrl = "default-cover.jpg"; 

          if (coverArtRelationship) {
            const coverResponse = await axios.get(`${MANGADX_API_URL}/cover/${coverArtRelationship.id}`);
            const filename = coverResponse.data.data.attributes.fileName;
            coverUrl = `https://uploads.mangadex.org/covers/${mangaId}/${filename}`;
          }

          return {
            id: mangaId,
            title: attributes.title,
            description: attributes.description,
            cover: coverUrl,
            status: attributes.status,
            year: attributes.year,
            genres: attributes.tags.filter((tag) => tag.attributes.group === "genre").map((tag) => tag.attributes.name.en),
          };
        } catch (error) {
          return null;
        }
      });

      const mangaDetails = (await Promise.all(mangaDetailsPromises)).filter((details) => details);

      cache.set(cacheKey, mangaDetails);

      return res.json(mangaDetails);
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
    const query = req.query.query || "";

    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    const cacheKey = `manga-query-${query}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    }

    try {
      const searchResponse = await axios.get(`${MANGADX_API_URL}/manga`, { params: { title: query } });

      if (!searchResponse.data?.data?.length) {
        return res.status(404).json({ error: "No manga found for the given query" });
      }

      const mangaIds = searchResponse.data.data.map((manga) => manga.id);

      const mangaDetailsPromises = mangaIds.map(async (mangaId) => {
        try {
          const mangaDetailsResponse = await axios.get(`${MANGADX_API_URL}/manga/${mangaId}`);
          const attributes = mangaDetailsResponse.data.data.attributes;
          const relationships = mangaDetailsResponse.data.data.relationships || [];

          const coverArtRelationship = relationships.find((rel) => rel.type === "cover_art");
          let coverUrl = "default-cover.jpg"; 

          if (coverArtRelationship) {
            const coverResponse = await axios.get(`${MANGADX_API_URL}/cover/${coverArtRelationship.id}`);
            const filename = coverResponse.data.data.attributes.fileName;
            coverUrl = `https://uploads.mangadex.org/covers/${mangaId}/${filename}`;
          }

          return {
            id: mangaId,
            title: attributes.title,
            description: attributes.description,
            cover: coverUrl,
            status: attributes.status,
            year: attributes.year,
            genres: attributes.tags.filter((tag) => tag.attributes.group === "genre").map((tag) => tag.attributes.name.en),
          };
        } catch (error) {
          return null;
        }
      });

      const mangaDetails = (await Promise.all(mangaDetailsPromises)).filter((details) => details);

      cache.set(cacheKey, mangaDetails);

      return res.json(mangaDetails);
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
};

export default handler;
>>>>>>> 1f0d6e76c56170febf855ad016dcaeb4bea37b11
