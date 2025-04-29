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
        "name": "Best Torrents"
      }
    ],
    "idPrefixes": ["tt", "movie", "tvshow"]
  });
});

// Example endpoint to fetch torrent data (filtering by resolution and seeders)
app.get('/getTorrents', (req, res) => {
  // This is where you would integrate with a torrent source (such as Torrentio API)
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

// Stream endpoint that Stremio will use to play the selected torrent
app.get('/stream/:torrentId', (req, res) => {
  const torrentId = req.params.torrentId;

  // You can modify this to fetch a specific torrent's stream URL from a torrent provider
  // For example, retrieve the magnet link or file URL for the torrent
  const streamUrls = {
    "torrent1": "http://example.com/torrent1/stream.m3u8",  // Example stream URL for torrent1
    "torrent2": "http://example.com/torrent2/stream.m3u8"   // Example stream URL for torrent2
  };

  const streamUrl = streamUrls[torrentId];
  
  if (streamUrl) {
    res.json({ 
      streams: [
        {
          "url": streamUrl, // Provide the actual stream URL
          "type": "hls",    // For HLS streams (e.g., .m3u8)
          "quality": "720p", // Adjust quality based on torrent info
        }
      ]
    });
  } else {
    res.status(404).json({ error: "Stream not found" });
  }
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
