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

  // Mock catalog data (you can replace this with actual data from a torrent API)
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

// Stream endpoint that Stremio will use to play the selected torrent
app.get('/stream/:torrentId', (req, res) => {
  const torrentId = req.params.torrentId;

  // Mock stream URLs for each torrent (replace with actual logic to get a stream URL)
  const streamUrls = {
    "tt1234567": "http://example.com/torrent1/stream.m3u8",
    "tt2345678": "http://example.com/torrent2/stream.m3u8"
  };

  const streamUrl = streamUrls[torrentId];

  if (streamUrl) {
    res.json({
      streams: [
        {
          url: streamUrl, // Provide the actual stream URL
          type: "hls", // For HLS streams (e.g., .m3u8)
          quality: "720p", // Adjust quality based on torrent info
        }
      ]
    });
  } else {
    res.status(404).json({ error: "Stream not found" });
  }
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
