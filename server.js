const express = require('express');
const fetch = require('node-fetch');
const app = express();

// Your custom function to fetch torrents (replace with your actual API if available)
const fetchTorrents = async (type, id) => {
  // Example: Fetch from a custom API or service (you can integrate the logic from Torrentio or any source)
  const response = await fetch(`https://your-custom-api/torrents/${type}/${id}`);
  const torrents = await response.json();
  return torrents;
};

// Endpoint for the Stremio manifest
app.get('/manifest.json', (req, res) => {
  res.json({
    id: 'org.alexsdev.smartpicker',
    version: '1.0.0',
    name: 'Smart Torrentio Picker',
    description: 'Auto-picks the best torrent (720p > 1080p) for Stremio.',
    logo: 'https://raw.githubusercontent.com/stakepit/smart-torrentio-picker/main/logo.png',
    resources: ['stream'],
    types: ['movie', 'series'],
    idPrefixes: ['tt'],
  });
});

// Endpoint to handle the stream request and return the best torrent stream
app.get('/stream/:type/:id', async (req, res) => {
  const { type, id } = req.params;

  try {
    // Fetch torrents
    const torrents = await fetchTorrents(type, id);

    if (torrents && torrents.length > 0) {
      // Sort torrents by seeders (descending) and prefer 720p over 1080p
      torrents.sort((a, b) => b.seeders - a.seeders);

      // Pick the best torrent (prefer 720p, then 1080p)
      const bestTorrent = torrents.find(torrent => torrent.resolution === '720p') || torrents.find(torrent => torrent.resolution === '1080p');
      
      if (bestTorrent) {
        res.json({
          streams: [
            {
              url: bestTorrent.url,  // Use the URL of the best torrent
              name: bestTorrent.title || 'Best Pick',
              behaviorHints: {
                immediatePlay: true,  // Auto-play when selected
              }
            }
          ]
        });
      } else {
        res.json({ streams: [] });
      }
    } else {
      res.json({ streams: [] });
    }
  } catch (error) {
    console.error("Error fetching streams:", error);
    res.json({ streams: [] });
  }
});

// Run the app
app.listen(3000, () => {
  console.log('Smart Torrentio Picker is running on http://localhost:3000');
});
