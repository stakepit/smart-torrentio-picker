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
  description: "Picks the best torrent (720p > 1080p) and lets you play it with a button.",
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

    // Filter and prioritize 720p then 1080p
    const preferredOrder = ["720p", "1080p"];
    let bestStream = null;

    for (const resolution of preferredOrder) {
      const filtered = streams.filter(s => s.quality === resolution && s.url);
      if (filtered.length > 0) {
        bestStream = filtered.sort((a, b) => (b.seeders || 0) - (a.seeders || 0))[0];
        break;
      }
    }

    // Fallback to first available stream if none found
    if (!bestStream) {
      bestStream = streams.find(s => s.url);
    }

    if (!bestStream) {
      return res.json({ streams: [] });
    }

    // Return a button with the best torrent selected
    res.json({
      streams: [
        {
          url: bestStream.url,
          name: "Play Best Pick",
          title: bestStream.title || "Best Pick",
          behaviorHints: {
            notWebReady: false,
            immediatePlay: false, // Don't autoplay
            bingeGroup: id,
          },
          // Custom button logic
          customButton: {
            label: "Play Best Pick",  // Label for the button
            action: bestStream.url,   // When clicked, play the best stream
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
