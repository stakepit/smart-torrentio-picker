const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 7000;
const TORRENTIO_BASE = 'https://torrentio.strem.fun';

app.use(cors());

const manifest = {
  id: "org.alexsdev.smartpicker",
  version: "1.0.0",
  name: "Smart Torrentio Picker",
  description: "Auto-selects and autoplays the best torrent (720p > 1080p).",
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
    const response = await fetch(`${TORRENTIO_BASE}/stream/${type}/${id}.json`);
    const streams = await response.json();

    if (!Array.isArray(streams) || streams.length === 0) {
      return res.json({ streams: [] });
    }

    // Filter and prioritize
    const preferredOrder = ["720p", "1080p"];
    let bestStream = null;

    for (const resolution of preferredOrder) {
      const filtered = streams.filter(s => s.quality === resolution && s.url);
      if (filtered.length > 0) {
        bestStream = filtered.sort((a, b) => (b.seeders || 0) - (a.seeders || 0))[0];
        break;
      }
    }

    // Fallback
    if (!bestStream) {
      bestStream = streams.find(s => s.url);
    }

    if (!bestStream) {
      return res.json({ streams: [] });
    }

    // Force autoplay via minimal valid response
    res.json({
      streams: [
        {
          url: bestStream.url,
          name: "Auto Play",
          title: bestStream.title || "Best Pick",
          behaviorHints: {
            bingeGroup: id,
            notWebReady: false,
            autoplay: true,
            immediatePlay: true
          }
        }
      ]
    });

  } catch (error) {
    console.error("Error fetching streams:", error);
    res.json({ streams: [] });
  }
});

app.listen(PORT, () => {
  console.log(`Smart Picker running on port ${PORT}`);
});
