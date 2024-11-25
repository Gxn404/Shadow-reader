import axios from "axios";
import NodeCache from "node-cache";
import cors from "cors";

const cache = new NodeCache({ stdTTL: process.env.CACHE_TTL || 600, checkperiod: 300 });
const MANGADX_API_URL = process.env.MANGADX_API_URL || "https://api.mangadex.org";

const handler = async (req, res) => {
  cors()(req, res, async () => {
    const mangaId = req.query.id || req.url.split("/").pop();
    console.log("Manga ID:", mangaId);

    if (!mangaId) {
      return res.status(400).json({ error: "Manga ID is required" });
    }

    const cacheKey = `manga-${mangaId}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    }

    try {
      // Fetch manga details
      const mangaResponse = await axios.get(`${MANGADX_API_URL}/manga/${mangaId}`);
      const mangaData = mangaResponse.data.data.attributes;

      // Extract relationships for author, artist, and related manga
      const relationships = mangaResponse.data.data.relationships;
      const authorId = relationships.find(rel => rel.type === "author")?.id;
   //   const artistId = relationships.find(rel => rel.type === "artist")?.id;
      const relatedMangaIds = relationships
        .filter(rel => rel.type === "related")
        .map(rel => rel.id);

      // Fetch author and artist data
      const authorData = authorId
        ? await axios.get(`${MANGADX_API_URL}/author/${authorId}`)
        : null;
     // const artistData = artistId
    //    ? await axios.get(`${MANGADX_API_URL}/artist/${artistId}`)
      //  : null;

      // Fetch related manga details
      const relatedManga = [];
      for (const relatedId of relatedMangaIds) {
        try {
          const relatedResponse = await axios.get(`${MANGADX_API_URL}/manga/${relatedId}`);
          relatedManga.push({
            id: relatedId,
            title: relatedResponse.data.data.attributes.title,
          });
        } catch (error) {
          console.error(`Error fetching related manga ${relatedId}:`, error);
        }
      }

      // Extract other fields like origination, scanlation, and publishers
      const origination = mangaData.originalLanguage || "Unknown";
      const scanlation = relationships
        .filter(rel => rel.type === "scanlation_group")
        .map(rel => rel.attributes.name) || ["Unknown"];
      const publishers = relationships
        .filter(rel => rel.type === "publisher")
        .map(rel => rel.attributes.name) || ["Unknown"];
      const rawLinks = relationships
        .filter(rel => rel.type === "raw")
        .map(rel => rel.attributes.url) || ["No raw link available"];

      // Build recommendations - example data
      const recommendations = [
        { title: "Attack on Titan: No Regrets", mangaId: "related-id-1" },
        { title: "Attack on Titan: Lost Girls", mangaId: "related-id-2" },
      ];

      // Generate dummy chapter data (replace with real API calls if available)
      const chapters = [
        { number: 1, title: "To You, 2,000 Years From Now" },
        { number: 2, title: "That Day, The Girl Was Still Alive" },
        { number: 3, title: "A Maiden's Promise" },
      ];

      // Simulate comment data (In actual use, fetch from a related comment endpoint)
      const comments = [
        {
          user: "User1",
          comment: "This manga is absolutely amazing! The world-building is incredible.",
          timestamp: "2024-11-20T12:00:00Z",
          likes: 120,
        },
        {
          user: "User2",
          comment: "I’m hooked after the first chapter! Can’t wait to see what happens next.",
          timestamp: "2024-11-21T15:30:00Z",
          likes: 90,
        },
        {
          user: "User3",
          comment: "Great art and intense story. A must-read for any action fan.",
          timestamp: "2024-11-22T09:45:00Z",
          likes: 150,
        },
      ];

      // Build the enriched manga object
      const manga = {
        id: mangaResponse.data.data.id,
        title: mangaData.title,
        description: mangaData.description,
        status: mangaData.status,
        year: mangaData.year,
        genres: mangaData.tags.map(tag => tag.attributes.name), // Extract genres
        themes: ["Survival", "Betrayal", "Humanity"], // Example themes
        origination,
        scanlation,
        publishers,
        rawLinks,
        recommendations,
        author: authorData ? authorData.data.data.attributes.name : "Unknown",
        //artist: artistData ? artistData.data.data.attributes.name : "Unknown",
        related: relatedManga,
        chapters: chapters,
        comments, // Include the simulated comment data
        links: {
          mangadex: `${MANGADX_API_URL}/manga/${mangaId}`,
          author: authorId ? `${MANGADX_API_URL}/author/${authorId}` : null,
        //  artist: artistId ? `${MANGADX_API_URL}/author/${artistId}` : null,
        },
      };

      // Save to cache
      cache.set(cacheKey, manga);

      return res.json(manga);
    } catch (error) {
      console.error("Error fetching manga data:", error); // Log the error for debugging
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
};

export default handler;
