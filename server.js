const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 7000;

app.use(cors());

const manifest = {
  "id": "org.alexsdev.smarttorrentpicker",
  "version": "1.0.0",
  "name": "Smart Torrent Picker",
  "description": "Fetches and selects the best 720p torrent from public indexers.",
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

  // Mockup example with public YTS torrent search
  const ytsApiUrl = `https://yts.mx/api/v2/list_movies.json?query_term=${id}`;

  try {
    const response = await fetch(ytsApiUrl);
    const result = await response.json();
    const movies = result.data.movies || [];
    const torrents = movies.flatMap(movie => movie.torrents || []);

    const preferred = torrents
      .filter(t => t.quality === "720p" || t.quality === "1080p")
      .sort((a, b) => b.seeds - a.seeds)[0];

    if (preferred) {
      res.json({
        streams: [{
          name: "SmartTorrent",
          title: `${preferred.quality} - ${preferred.seeds} seeds`,
          infoHash: preferred.hash,
          behaviorHints: {
            bingeGroup: id
          }
        }]
      });
    } else {
      res.json({ streams: [] });
    }
  } catch (err) {
    console.error("Error fetching torrent:", err);
    res.json({ streams: [] });
  }
});

app.listen(PORT, () => {
  console.log(`Smart Torrent Picker running on port ${PORT}`);
});
