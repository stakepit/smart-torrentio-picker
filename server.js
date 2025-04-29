const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Enable CORS to allow requests from Stremio

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
        "name": "Best Torrents Movies",
        "isFeatured": true
      },
      {
        "type": "series",
        "id": "best-torrents-series",
        "name": "Best Torrents Series",
        "isFeatured": true
      }
    ],
    "idPrefixes": ["tt", "movie", "tvshow"]
  });
});

// Fetch catalog (movies and series) with thumbnails
app.get('/catalog/:type', (req, res) => {
  const type = req.params.type; // "movie" or "series"

  // Mock catalog data (replace this with actual data from a torrent API)
  const catalog = [
    {
      id: "tt1234567",
      title: "Example Movie",
      year: 2025,
      type: "movie",
      thumbnail: "http://example.com/thumbnails/movie1.jpg", // Add thumbnail URL
      resolution: "720p",
      seeders: 500,
    },
    {
      id: "tt2345678",
      title: "Example Series",
      year: 2023,
      type: "series",
      thumbnail: "http://example.com/thumbnails/series1.jpg", // Add thumbnail URL
      resolution: "1080p",
      seeders: 1000,
    }
  ];

  // Filter by the requested type ("movie" or "series")
  const filteredCatalog = catalog.filter(item => item.type === type);

  res.json({
    meta: { total: filteredCatalog.length },
    results: filteredCatalog
  });
});

// Stream endpoint that Stremio will use to play the selected torrent (auto-select)
app.get('/stream/:torrentId', (req, res) => {
  const torrentId = req.params.torrentId;

  // Fetch torrent data for the given ID and determine the best stream URL
  const torrents = {
    "tt1234567": [
      {
        resolution: "720p",
        seeders: 500,
        url: "http://example.com/torrent1/stream.m3u8",
      },
      {
        resolution: "1080p",
        seeders: 1000,
        url: "http://example.com/torrent2/stream.m3u8",
      }
    ],
    "tt2345678": [
      {
        resolution: "720p",
        seeders: 300,
        url: "http://example.com/torrent3/stream.m3u8",
      },
      {
        resolution: "1080p",
        seeders: 800,
        url: "http://example.com/torrent4/stream.m3u8",
      }
    ]
  };

  // Retrieve the list of torrents for the given movie/series ID
  const torrentList = torrents[torrentId];

  if (!torrentList) {
    return res.status(404).json({ error: "Torrent not found" });
  }

  // Sort torrents by resolution (prefer 720p if possible) and seeders
  const bestTorrent = torrentList
    .filter(torrent => torrent.resolution === "720p" || torrent.resolution === "1080p")  // Filter by resolution
    .sort((a, b) => b.seeders - a.seeders)[0]; // Sort by seeders, descending

  if (bestTorrent) {
    res.json({
      streams: [
        {
          url: bestTorrent.url, // Provide the selected torrent stream URL
          type: "hls", // Stream type (HLS in this case)
          quality: bestTorrent.resolution, // Quality (720p or 1080p)
        }
      ]
    });
  } else {
    res.status(404).json({ error: "No suitable stream found" });
  }
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
