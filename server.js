const express = require('express');
const cors = require('cors');
const TorrentSearchApi = require('torrent-search-api');

const app = express();
app.use(cors());

// TorrentSearch setup
TorrentSearchApi.enablePublicProviders();
TorrentSearchApi.enableProvider('ThePirateBay');
TorrentSearchApi.enableProvider('Yts');
TorrentSearchApi.enableProvider('Eztv');

// Manifest definition
const manifest = {
  "id": "org.alexsdev.smartautoplay",
  "version": "3.0.0",
  "name": "SmarT-Autoplay",
  "description": "Finds best source for movies and TV shows.",
  "logo": "https://raw.githubusercontent.com/stakepit/smart-torrentio-picker/main/logo.png",
  "resources": ["stream"],
  "types": ["movie", "series"],
  "idPrefixes": ["tt"],
  "behaviorHints": {
    "configurable": false,
    "adult": false
  }
};

// Manifest endpoint
app.get('/manifest.json', (req, res) => {
  res.send(manifest);
});

// Stream endpoint
app.get('/stream/:type/:id.json', async (req, res) => {
  const { type, id } = req.params;

  try {
    const query = id.startsWith('tt') ? id : 'Popular Movie'; // fallback query
    const torrents = await TorrentSearchApi.search(query, type === 'series' ? 'TV' : 'Movies', 40);

    // Prioritize EZTV > YTS > others, filter 720p/1080p with rules
    const prioritized = torrents.sort((a, b) => {
      const order = ['eztv', 'yts', 'rarbg', 'thepiratebay'];
      return order.indexOf((a.provider || '').toLowerCase()) - order.indexOf((b.provider || '').toLowerCase());
    });

    const best = prioritized.find(t =>
      t.title.toLowerCase().includes('720p') &&
      (!t.size || t.size.includes('MB') && parseFloat(t.size) <= 800) &&
      (t.seeds || 0) > 30
    ) || prioritized.find(t =>
      t.title.toLowerCase().includes('1080p') &&
      (!t.size || t.size.includes('MB') && parseFloat(t.size) <= 1500) &&
      (t.seeds || 0) > 50
    );

    const stream = best ? [{
      name: best.title,
      title: best.title,
      infoHash: best.infoHash || '',
      url: best.magnet,
      behaviorHints: { notWebReady: false }
    }] : [];

    res.send(stream);
  } catch (err) {
    console.error("Error fetching torrents:", err);
    res.send([]);
  }
});

const port = process.env.PORT || 7000;
app.listen(port, () => {
  console.log(`SmarT-Autoplay addon running on port ${port}`);
});
