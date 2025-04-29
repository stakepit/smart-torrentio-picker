const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 7000;
const TORRENTIO_BASE = 'https://torrentio.strem.fun'; // Make sure Torrentio API is correct

app.use(cors());

// Manifest for the Stremio addon
const manifest = {
  id: "org.alexsdev.smartpicker",
  version: "1.0.0",
  name: "Smart Torrentio Picker",
  description: "Auto-picks the best torrent (720p > 1080p) for Stremio.",
  logo: "https://raw.githubusercontent.com/stakepit/smart-torrentio-picker/main/logo.png",
  resources: ["stream"],
  types: ["movie", "series"],
  idPrefixes: ["tt"]
};

app.get('/manifest.json', (req, res) => {
  res.json(manifest);
});

// Fetching streams from Torrentio
app.get('/stream/:type/:id', async (req, res) => {
  const { type, id } = req.params;

  try {
    // Fetch stream data from Torrentio
    const response = await fetch(`${TORRENTIO_BASE}/stream/${type}/${id}.json`);
    const streams = await response.json();

    if (!Array.isArray(streams) || streams.length === 0) {
      return res.json({ streams: [] });  // No streams available
    }

    // Filter streams by 720p or 1080p, prefer 720p
    const preferredOrder = ["720p", "1080p"];
    let bestStream = null;

    for (const resolution of preferredOrder) {
      const filtered = streams.filter(s => s.quality === resolution && s.url);
      if (filtered.length > 0) {
        bestStream = filtered.sort((a, b) => (b.seeders || 0) - (a.seeders || 0))[0]; // Sort by seeders
        break;
      }
    }

    // Fallback to the first available stream if no 720p or 1080p found
    if (!bestStream) {
      bestStream = streams.find(s => s.url); // Pick the first available stream
    }

    if (!bestStream) {
      return res.json({ streams: [] });  // No valid streams found
    }

    // Return the best stream with autoplay flag
    res.json({
      streams: [
        {
          url: bestStream.url,  // Make sure this is a direct playable URL
          name: "Best Pick",
          title: bestStream.title || "Best Pick",
          behaviorHints: {
            notWebReady: false,  // Make sure this is set to false for auto-play
            immediatePlay: true,  // Auto-play the best stream
            bingeGroup: id,
          },
        }
      ]
    });

  } catch (error) {
    console.error("Error fetching streams:", error);
    res.json({ streams: [] });  // Error case, return empty streams
  }
});

app.listen(PORT, () => {
  console.log(`Smart Picker running on port ${PORT}`);
});
