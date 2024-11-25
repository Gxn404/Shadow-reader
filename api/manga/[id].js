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
      const artistId = relationships.find(rel => rel.type === "artist")?.id;
      const relatedMangaIds = relationships
        .filter(rel => rel.type === "related")
        .map(rel => rel.id);

      // Fetch author and artist data
      const authorData = authorId
        ? await axios.get(`${MANGADX_API_URL}/author/${authorId}`)
        : null;
      const artistData = artistId
        ? await axios.get(`${MANGADX_API_URL}/author/${artistId}`)
        : null;

      // Fetch related manga details
      const relatedManga = [];
      for (const related of relationships.filter(rel => rel.type === "manga" && rel.related)) {
  const relatedId = related.id;
  const relatedComicType = related.type;
  const relatedType = related.related || "Unknown"; // Relationship type (e.g., shared_universe, sequel, prequel, etc.)

try {
    const relatedResponse = await axios.get(`${MANGADX_API_URL}/manga/${relatedId}`);
    const relatedMangaAttributes = relatedResponse.data.data.attributes;

    // Collect related manga data with relationship type included
    relatedManga.push({
      id: relatedId,
      title: relatedMangaAttributes.title,
      description: relatedMangaAttributes.description || "No description available",
      genres: relatedMangaAttributes.tags
        .filter(tag => tag.attributes.group === "genre")
        .map(tag => tag.attributes.name.en),
      themes: relatedMangaAttributes.tags
        .filter(tag => tag.attributes.group === "theme")
        .map(tag => tag.attributes.name.en),
       relatedType, 
       relatedComicType
       // Add the relationship type (e.g., sequel, prequel, etc.)
    });
  } catch (error) {
    console.error(`Error fetching related manga ${relatedId}:`, error);
  }
}

      // Extract other fields like origination, scanlation, and publishers
      const origination = mangaData.originalLanguage || "Unknown";
      
      const publishers = relationships
        .filter(rel => rel.type === "publisher")
        .map(rel => rel.attributes.name) || ["Unknown"];
      const rawLinks = mangaData.links || ["No raw link available"];

      // Build recommendations - example data
      const recommendations = [
        { title: "Attack on Titan: No Regrets", mangaId: "related-id-1" },
        { title: "Attack on Titan: Lost Girls", mangaId: "related-id-2" },
      ];

      // Generate dummy chapter data (replace with real API calls if available)
      const chapterResponse = await axios.get(`${MANGADX_API_URL}/manga/${mangaId}/feed`);
       
       const chapterData = chapterResponse.data.data.map(chapter => chapter.attributes);
       console.log(JSON.stringify(chapterData));
       
       const chapterRelationships = chapterResponse.data.data.map(chapter => chapter.relationships);
       
       const chapterId = chapterResponse.data.data.map(chapter => chapter.id);
       
       const chapter = chapterData.map((chapter, index) => ({
  id: chapterId[index], // this might not be correct as `chapterId` is an array, so check its usage
  chapter: chapter.chapter,
  volume: chapter.volume,
  title: chapter.title,
  translatedLanguage: chapter.translatedLanguage,
  externalUrl: chapter.externalUrl,
  publishAt: chapter.publishAt,
  readableAt: chapter.readableAt,
  createdAt: chapter.createdAt,
  updatedAt: chapter.updatedAt,
  pages: chapter.pages,
uploadedUser: chapterRelationships[index]
  .filter(rel => rel.type === "user")
  .map(rel => rel.id || "N/A"),
  scanlation : chapterRelationships[index].filter(rel => rel.type === "scanlation_group")
        .map(rel => (rel.id)) || ["Unknown"]
}));

const sortedChapters = chapter.sort((a, b) => a.chapter - b.chapter);


const scanlation = chapterRelationships[0]
        .map(rel => (rel.id)) || ["Unknown"];
        console.log(scanlation);
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
        demography : mangaData.publicationDemographic,
        contentRating : mangaData.contentRating,
        genres: mangaData.tags.filter(tag => tag.attributes.group === "genre").map(tag => tag.attributes.name.en), // Extract genres
        themes: mangaData.tags.filter(tag => tag.attributes.group === "theme").map(tag => tag.attributes.name.en), // Example themes
        origination,
        scanlation,
        publishers,
        rawLinks,
        recommendations,
        author: authorData ? authorData.data.data.attributes.name : "Unknown",
        artist: artistData ? artistData.data.data.attributes.name : "Unknown",
        related: relatedManga,
        updatedChapter : mangaData.latestUploadedChapter,
        lastChapter : mangaData.lastChapter,
        lastVolume : mangaData.lastVolume,
        availableTranslatedLanguages : mangaData.availableTranslatedLanguages,
        chapters: sortedChapters,
        comments, // Include the simulated comment data
        links: {
          mangadex: `${MANGADX_API_URL}/manga/${mangaId}`,
          author: authorId ? `${MANGADX_API_URL}/author/${authorId}` : null,
         artist: artistId ? `${MANGADX_API_URL}/author/${artistId}` : null,
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
