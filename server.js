const express = require('express');
const cors = require('cors');
const app = express();

// Use CORS to allow requests from any origin
app.use(cors());

// Serve the manifest.json for Stremio
app.get('/manifest.json', (req, res) => {
  res.json({
    "id": "com.example.torrentio-picker",
    "version": "1.0.0",
    "name": "Smart Torrent Picker",
    "description": "This addon selects the best torrents with 720p or higher resolution and the most seeders.",
    "resources": ["catalog", "stream"],
    "types": ["movie", "series"],
    "catalogs": [
      {
        "type": "movie",
        "id": "best-torrents",
        "name": "Best Torrents"
      }
    ],
    "idPrefixes": ["tt", "movie", "tvshow"]
  });
});

// Example endpoint to fetch torrent data
app.get('/getTorrents', (req, res) => {
  // This is where you would integrate with a torrent source
  const torrents = [
    {
      title: "Example Movie 720p",
      resolution: "720p",
      seeders: 500,
      url: "http://example.com/torrent1"
    },
    {
      title: "Example Movie 1080p",
      resolution: "1080p",
      seeders: 1000,
      url: "http://example.com/torrent2"
    }
  ];

  // Filter torrents by 720p resolution or higher, and sort by seeders
  const sortedTorrents = torrents.filter(torrent => torrent.resolution === "720p" || torrent.resolution === "1080p")
                                 .sort((a, b) => b.seeders - a.seeders);

  res.json(sortedTorrents);
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
