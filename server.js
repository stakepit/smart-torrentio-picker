const express = require('express');
const app = express();

// Helper function to select the best torrent based on resolution and seeders
const selectBestTorrent = (torrents) => {
  if (torrents.length === 0) return null;

  // Sort torrents by seeders (descending order)
  torrents.sort((a, b) => b.seeders - a.seeders);

  // Prioritize 720p over 1080p, then take the first torrent
  const best720p = torrents.find(t => t.resolution === '720p');
  if (best720p) {
    return best720p;
  } else {
    // If no 720p, fallback to 1080p
    return torrents.find(t => t.resolution === '1080p');
  }
};

// Endpoint to serve the manifest
app.get('/manifest.json', (req, res) => {
  res.json({
    id: 'org.alexsdev.smartpicker',
    version: '1.0.0',
    name: 'Smart Torrent Picker',
    description: 'Automatically picks the best torrent (720p > 1080p) for Stremio.',
    logo: 'https://yourlogo.url/logo.png',
    resources: ['stream'],
    types: ['movie', 'series'],
    idPrefixes: ['tt']
  });
});

// API to handle the stream and return the best torrent URL
app.get('/stream/:type/:id', async (req, res) => {
  const { type, id } = req.params;

  // Assuming that the "type" is either "movie" or "series", and we search for torrents
  const torrents = [
    // Sample torrents, replace with actual data from your source
    { resolution: '1080p', seeders: 500, url: 'https://example.com/torrent1' },
    { resolution: '720p', seeders: 800, url: 'https://example.com/torrent2' },
    { resolution: '1080p', seeders: 300, url: 'https://example.com/torrent3' }
  ];

  // Select the best torrent based on seeders and resolution
  const bestTorrent = selectBestTorrent(torrents);

  if (bestTorrent) {
    res.json({
      streams: [
        {
          url: bestTorrent.url, // URL of the best torrent
          name: bestTorrent.resolution + ' - ' + bestTorrent.seeders + ' seeders', // Display name for the torrent
          behaviorHints: {
            immediatePlay: true // Auto-play the best torrent
          }
        }
      ]
    });
  } else {
    res.json({ streams: [] }); // No valid torrents found
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Smart Torrent Picker running on http://localhost:3000');
});
