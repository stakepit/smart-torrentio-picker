const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 7000;

// Mock function: Replace with actual Torrentio source parsing logic
function getBestTorrentFromSources(id) {
  const fakeTorrents = [
    { url: "magnet:?xt=urn:btih:123", resolution: "480p", seeds: 100 },
    { url: "magnet:?xt=urn:btih:456", resolution: "720p", seeds: 500 },
    { url: "magnet:?xt=urn:btih:789", resolution: "1080p", seeds: 300 },
  ];

  // Prioritize by resolution and seeds (720p before 1080p)
  const preferredOrder = ["720p", "1080p"];
  for (const res of preferredOrder) {
    const filtered = fakeTorrents.filter(t => t.resolution === res);
    if (filtered.length) {
      return filtered.sort((a, b) => b.seeds - a.seeds)[0];
    }
  }

  // Fallback: highest seeds
  return fakeTorrents.sort((a, b) => b.seeds - a.seeds)[0];
}

app.use(cors());

const manifest = {
  id: "org.alexsdev.smartpicker",
  version: "1.0.0",
  name: "Smart Torrentio Picker",
  description: "Auto-selects the best torrent and plays it instantly.",
  logo: "https://raw.githubusercontent.com/stakepit/smart-torrentio-picker/main/logo.png",
  resources: ["stream"],
  types: ["movie", "series"],
  catalogs: [],
  idPrefixes: ["tt"]
};

app.get('/manifest.json', (req, res) => {
  res.json(manifest);
});

app.get('/stream/:type/:id', (req, res) => {
  const { type, id } = req.params;

  const bestTorrent = getBestTorrentFromSources(id);

  if (!bestTorrent) {
    return res.json({ streams: [] });
  }

  res.json({
    streams: [
      {
        url: bestTorrent.url,
        title: `Best ${bestTorrent.resolution} - ${bestTorrent.seeds} seeders`,
        name: "Auto",
        quality: bestTorrent.resolution,
        behaviorHints: {
          bingeGroup: id,
          notWebReady: false
        }
      }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
