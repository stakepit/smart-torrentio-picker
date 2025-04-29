const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 7000;
const TORRENTIO_BASE = 'https://torrentio.strem.fun';

app.use(cors());

// Manifest for the Stremio addon
const manifest = {
  id: "org.alexsdev.smartpicker",
  version: "1.0.0",
  name: "Smart Torrentio Picker",
  description: "Picks the best torrent (720p > 1080p) and integrates it as a source for Stremio.",
  logo: "https://raw.githubusercontent.com/stakepit/smart-torrentio-picker/main/logo.png",
  resources: ["stream"],
  types: ["movie", "series"],
  idPrefixes: ["tt"]
};

app.get('/manifest.json', (req, res) => {
  res.json(manifest);
});

// Endpoint to fetch streams from Torrentio for movies or series
app.get('/stream/:type/:id', async (req, res) => {
  const { type, id } = req.params;

  try {
    // Fetch the stream data from Torrentio
    const response = await fetch(`${TORRENTIO_BASE}/stream/${type}/${id}.json`);
    const streams = await response.json();

    if (!Array.isArray(streams) || streams.length === 0) {
      return res.json({ streams: [] });
    }

    // Filter the streams to prioritize 720p > 1080p
    const preferredOrder = ["720p", "1080p"];
    let bestStream = null;

    for (const resolution of preferredOrder) {
      const filtered = streams.filter(s => s.quality === resolution && s.url);
      if (filtered.length > 0) {
        bestStream = filtered.sort((a, b) => (b.seeders || 0) - (a.seeders || 0))[0];
        break;
      }
    }

    // Fallback to first available stream if no 720p or 1080p streams found
    if (!bestStream) {
      bestStream = streams.find(s => s.url);
    }

    if (!bestStream) {
      return res.json({ streams: [] });
    }

    // Return the best stream with a play hint (immediate play)
    res.json({
      streams: [
        {
          url: bestStream.url,
          name: "Best Pick",
          title: bestStream.title || "Best Pick",
          behaviorHints: {
            notWebReady: false,
            immediatePlay: true,  // Auto play the best stream
            bingeGroup: id,
          },
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
