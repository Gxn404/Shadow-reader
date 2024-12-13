import axios from 'axios';
import NodeCache from 'node-cache';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file if not already loaded
dotenv.config();

const cache = new NodeCache({
  stdTTL: process.env.CACHE_TTL || 600, 
  checkperiod: 300
});
const MANGADX_API_URL = process.env.MANGADX_API_URL || 'https://api.mangadex.org';

const handler = async (req, res) => {
  cors()(req, res, async () => {
    const chapterId = req.query.id || req.url.split('/').pop();
    console.log('Chapter ID:', chapterId);

    if (!chapterId) {
      return res.status(400).json({ error: 'Chapter ID is required' });
    }

    const cacheKey = `chapter-${chapterId}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    }

    try {
      // Fetch chapter hash details
      const chapterResponse = await axios.get(`${MANGADX_API_URL}/at-home/server/${chapterId}`);
      const chapterData = chapterResponse.data.chapter;

      // Function to extract page number from filename
      const extractPageNumber = (filename) => {
  // Improved regex to handle filenames with or without the 'x' before the page number
  const match = filename.match(/(?:x?)(\d+)-/);  // Looks for an optional 'x' and then the page number followed by '-'

  // If no match, log the filename and return -1
  if (!match) {
    console.error(`Failed to extract page number from filename: ${filename}`);
    return -1;
  }

  // Return the extracted page number as an integer
  return parseInt(match[1], 10);
};

      // Extract chapter pages without datasaver
      const chapterPagesWDs = chapterData.data || []; // Assuming pages are under "data"
      
      // Extract chapter pages with datasaver (if applicable)
      const chapterPagesDs = chapterData.dataSaver || [];

      // Function to format the page URLs with baseUrl
      const formatPages = (pages, type) => {
        return pages.map((page) => {
          const pageNumber = extractPageNumber(page);
          return {
            pageNumber,
            url: `${chapterResponse.data.baseUrl}/${type}/${chapterData.hash}/${page}`
          };
        }).sort((a, b) => a.pageNumber - b.pageNumber); // Sort by page number
      };

      const chapterPageData = {
        type: 'data', // The type should be a string
        pages: formatPages(chapterPagesWDs, 'data')
      };

      const chapterPageDataSaver = {
        type: 'dataSaver',
        pages: formatPages(chapterPagesDs, 'dataSaver')
      };

      // Build the enriched manga object
      const chapterDetails = {
        baseUrl: chapterResponse.data.baseUrl,
        hash: chapterData.hash,
        totalPages: chapterPagesWDs.length,
        pages: {
          chapterPageData,
          chapterPageDataSaver
        }
      };

      // Save to cache
      cache.set(cacheKey, chapterDetails);

      return res.json(chapterDetails);
    } catch (error) {
      console.error('Error fetching manga data:', error); // Log the error for debugging
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });
};

export default handler;