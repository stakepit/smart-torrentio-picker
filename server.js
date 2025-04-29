const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 7000;

app.use(cors());

const manifest = {
  "id": "org.alexsdev.smarttorrentproxy",
  "version": "1.0.0",
  "name": "Smart Torrent Proxy",
  "description": "Filters and plays only the best torrent from Torrentio (720p preferred).",
  "logo": "https://upload.wikimedia.org/wikipedia/commons/6/65/Black_Icon.png",
  "resources": ["stream"],
  "types": ["movie", "series"],
  "idPrefixes": ["tt"],
  "behaviorHints": {
    "configurable": false,
    "adult": false
  }
};

app.get('/manifest.json', (req, res) => {
  res.json(manifest);
});

app.get('/stream/:type/:id', async (req, res) => {
  const { type, id } = req.params;

  try {
    // Change this to your actual Torrentio public manifest or hosted address
    const torrentioURL = `https://torrentio.strem.fun/stream/${type}/${id}.json`;

    const response = await fetch(torrentioURL);
    const data = await response.json();

    if (!Array.isArray(data)) return res.json({ streams: [] });

    // Sort by 720p preferred, then seeders (if available)
    const sorted = data.sort((a, b) => {
      const getQualityScore = q => q.includes('720') ? 2 : q.includes('1080') ? 1 : 0;
      const qa = getQualityScore(a.title || '');
      const qb = getQualityScore(b.title || '');
      return qb - qa;
    });

    const best = sorted[0];

    if (best) {
      res.json({ streams: [best] });
    } else {
      res.json({ streams: [] });
    }
  } catch (err) {
    console.error('Error fetching from Torrentio:', err);
    res.json({ streams: [] });
  }
});

app.listen(PORT, () => {
  console.log(`Smart Torrent Proxy running on port ${PORT}`);
});
