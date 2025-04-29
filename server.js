const express = require('express');
const fetch = require('node-fetch');  // Make sure you install node-fetch
const app = express();

// Helper function to fetch torrents from the Torrentio API
const fetchTorrentsFromTorrentio = async (type, id) => {
  try {
    // Example API request to Torrentio (replace with your real API endpoint)
    const response = await fetch(`https://torrentio.api.url/search?query=${id}`);
    const data = await response.json();

    // Process the response and filter torrents
    return data.torrents || []; // Ensure that 'torrents' key exists in the response
  } catch (error) {
    console.error('Error fetching from Torrentio API:', error);
    return [];
  }
};

// Endpoint to serve manifest.json
app.get('/manifest.json', (req, res) => {
  res.json({
    id: 'org.alexsdev.smartpicker',
    version: '1.0.0',
    name: 'Smart Torrentio Picker',
    description: 'Auto-picks the best torrent (720p > 1080p) for Stremio.',
    logo: 'https://yourlogo.url/logo.png', // Use your actual logo URL
    resources: ['stream'],
    types: ['movie', 'series'],
    idPrefixes: ['tt'] // This defines which type of IDs we will be handling (e.g., IMDB IDs)
  });
});

// API to handle streaming requests and return the best torrent
app.get('/stream/:type/:id', async (req, res) => {
  const { type, id } = req.params;

  try {
    // Fetch torrents for the given type (movie/series) and ID (e.g., IMDB ID)
    const torrents = await fetchTorrentsFromTorrentio(type, id);

    if (torrents && torrents.length > 0) {
      // Sort torrents by seeders (descending order)
      torrents.sort((a, b) => b.seeders - a.seeders);

      // Prioritize 720p over 1080p
      const bestTorrent = torrents.find(t => t.resolution === '720p') || torrents.find(t => t.resolution === '1080p');

      if (bestTorrent) {
        res.json({
          streams: [
            {
              url: bestTorrent.url, // Best torrent URL
              name: bestTorrent.title || 'Best Pick', // Name the torrent
              behaviorHints: {
                immediatePlay: true // Make it autoplay when selected
              }
            }
          ]
        });
      } else {
        res.json({ streams: [] }); // No valid torrents
      }
    } else {
      res.json({ streams: [] }); // No torrents found
    }
  } catch (error) {
    console.error('Error fetching torrents:', error);
    res.json({ streams: [] }); // Return empty if error occurs
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Smart Torrentio Picker running on http://localhost:3000');
});
