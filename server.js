const express = require('express');
const app = express();

// Example manifest
const manifest = {
  id: "com.alexsdev.smarttorrentpicker",
  version: "1.0.0",
  name: "Smart Torrentio Picker",
  description: "Picks best torrents (720p/1080p) using Torrentio",
  types: ["movie", "series"],
  logo: "https://raw.githubusercontent.com/stakepit/smart-torrentio-picker/main/logo.png",
  resources: ["stream"],
  idPrefixes: ["tt"]
};

app.get('/manifest.json', (req, res) => {
  res.json(manifest);
});

app.get('/stream/:type/:id', (req, res) => {
  const streams = [
    {
      name: "Best 720p Torrent",
      title: "Smart 720p",
      url: "https://example.com/torrent-720p.magnet",
      behaviorHints: { bingeGroup: "smart" }
    },
    {
      name: "Best 1080p Torrent",
      title: "Smart 1080p",
      url: "https://example.com/torrent-1080p.magnet",
      behaviorHints: { bingeGroup: "smart" }
    }
  ];

  res.json({ streams });
});

// Set up the port to be used by Render (or fallback to 7000 for local testing)
const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
