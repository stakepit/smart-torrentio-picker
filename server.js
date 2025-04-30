const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

// Enable CORS to allow Stremio to fetch the addon
app.use(cors());

// Helper function to filter torrents based on size, seeders, and resolution
const filterBestTorrent = (torrents) => {
  let bestMatch = torrents.filter(t => 
    (t.size <= 800000000 && t.quality === '720p' && t.seeders >= 30)
  );

  // If no 720p match, look for 1080p with more than 50 seeders and less than 1500MB
  if (bestMatch.length === 0) {
    bestMatch = torrents.filter(t => 
      (t.size <= 1500000000 && t.quality === '1080p' && t.seeders >= 50)
    );
  }

  return bestMatch[0]; // Return the best torrent or undefined if none match
};

// Function to fetch torrents from public sources: RARBG, YTS, EZTV, ThePirateBay
const fetchTorrentsFromSources = async (type, id) => {
  const sources = [
    // RARBG API: Search for movies or shows (replace with correct API URL)
    `https://torrentapi.org/pubapi_v2.php?mode=search&search_string=${id}&format=json&category=movies&limit=100&ranked=1`,  // Example RARBG source
    `https://yts.mx/api/v2/list_movies.json?query_term=${id}`,  // Example YTS API (movies only)
    `https://eztv.re/api/get-torrents?query=${id}`,  // Example EZTV API (TV shows only)
    `https://thepiratebay.org/search/${id}/0/99/0`  // Example ThePirateBay search URL (basic GET)
  ];

  let torrents = [];

  // Fetch from each source
  for (const url of sources) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      // Check if the source returns torrents and add them to the torrents list
      if (data.torrents) {
        torrents = torrents.concat(data.torrents);
      } else if (data.movies) {
        torrents = torrents.concat(data.movies);
      }
    } catch (err) {
      console.error(`Error fetching from source: ${url}`, err);
    }
  }

  return torrents;
};

// Endpoint to handle search
app.get('/search/:type/:id', async (req, res) => {
  const { type, id } = req.params;

  try {
    // Fetch torrents from the public sources
    const torrents = await fetchTorrentsFromSources(type, id);

    // Filter torrents to return only the best option
    const bestTorrent = filterBestTorrent(torrents);

    if (bestTorrent) {
      res.json({
        streams: [{
          title: bestTorrent.title,
          url: bestTorrent.url,  // Assuming the `url` field is the torrent or magnet link
          quality: bestTorrent.quality,
          size: bestTorrent.size
        }]
      });
    } else {
      res.status(404).json({ error: 'No suitable torrents found' });
    }

  } catch (error) {
    console.error('Error fetching torrents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Starting the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
