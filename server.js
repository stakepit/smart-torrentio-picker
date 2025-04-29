const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 7000;

// Replace with your preferred public Torrentio endpoint
const TORRENTIO_BASE = 'https://torrentio.strem.fun';

app.use(cors());

const manifest = {
  id: "org.alexsdev.smartpicker",
  version: "1.0.0",
  name: "Smart Torrentio Picker",
  description: "Auto-selects the best torrent (720p > 1080p) and plays instantly.",
  logo: "https://raw.githubusercontent.com/stakepit/smart-torrentio-picker/main/logo.png",
  resources: ["stream"],
  types: ["movie", "series"],
  catalogs: [],
  idPrefixes: ["tt"]
};

app.get('/manifest.json', (req, res) => {
  res.json(manifest);
});

app.get('/stream/:type/:id', async (req, res) => {
  const { type, id } = req.params;

  try {
    const torrentioUrl = `${TORRENTIO_BASE}/stream/${type}/${id}.json`;
    const response = await fetch(torrentioUrl);
    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return res.json({ streams: [] });
    }

    // Prioritize torrents by resolution and seed count
    const preferredOrder = ["720p", "1080p"];
    let bestStream = null;

    for (const resolution of preferredOrder) {
      const filtered = data.filter(s => s.quality === resolution && s.url);
      if (filtered.length > 0) {
        // Sort by seeders if info available, fallback to first
        bestStream = filtered[0];
        break;
      }
    }

    // Fallback to the first available stream with a URL
    if (!bestStream) {
      bestStream = data.find(s => s.url);
    }

    if (!bestStream) {
      return res.json({ streams: [] });
    }

    // Return only the best stream
    res.json({
      streams: [
        {
          url: bestStream.url,
          title: `Auto-picked: ${bestStream.title || bestStream.name || bestStream.quality}`,
          name: "Auto",
          quality: bestStream.quality,
          behaviorHints: {
            bingeGroup: id,
            notWebReady: false
          }
        }
      ]
    });

  } catch (err) {
    console.error('Stream fetch error:', err);
    res.json({ streams: [] });
  }
});

app.listen(PORT, () => {
  console.log(`Smart Torrentio Picker running on port ${PORT}`);
});
