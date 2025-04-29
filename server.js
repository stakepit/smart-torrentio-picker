const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

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

// Return the manifest
app.get('/manifest.json', (req, res) => {
  res.json(manifest);
});

// Example stream handler
app.get('/stream/:type/:id', async (req, res) => {
  const { type, id } = req.params;

  // In a real implementation, you'd fetch torrent info from Torrentio here
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

module.exports = app;

