const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 7000;

app.use(cors());

const manifest = {
  "id": "org.alexsdev.smarttorrentplus",
  "version": "2.0.0",
  "name": "Smart Torrent Picker+",
  "description": "Fetches best torrents from EZTV/YTS. Prioritizes 720p, supports autoplay and binge.",
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
  let results = [];

  const addTorrents = (torrents, source) => {
    torrents.forEach(t => {
      const sizeMB = parseFloat(t.size.replace(/[^\d.]/g, ''));
      const is720p = t.title.includes("720p");
      const is1080p = t.title.includes("1080p");
      const seederCount = parseInt(t.seeders || 0);

      if (is720p && seederCount > 30 && sizeMB < 800) {
        results.push({ ...t, quality: "720p", source, score: seederCount + 20 });
      } else if (is1080p && seederCount > 50 && sizeMB < 1500) {
        results.push({ ...t, quality: "1080p", source, score: seederCount });
      }
    });
  };

  try {
    // EZTV
    const eztvRes = await fetch(`https://eztv.re/api/get-torrents?imdb_id=${id}`);
    const eztvData = await eztvRes.json();
    if (eztvData.torrents) addTorrents(eztvData.torrents, "EZTV");

    // YTS (movies only)
    if (type === "movie") {
      const ytsRes = await fetch(`https://yts.mx/api/v2/list_movies.json?query_term=${id}`);
      const ytsData = await ytsRes.json();
      const ytsTorrents = (ytsData.data.movies || []).flatMap(m => m.torrents.map(t => ({
        title: `${m.title} ${t.quality}`,
        size: t.size,
        seeders: t.seeds,
        infoHash: t.hash
      })));
      addTorrents(ytsTorrents, "YTS");
    }

    if (results.length === 0) return res.json({ streams: [] });

    const best = results.sort((a, b) => b.score - a.score)[0];
    const stream = {
      name: "SmartTorrent+",
      title: `${best.quality} ${best.source} - ${best.seeders} seeds`,
      infoHash: best.infoHash,
      fileIdx: 0,
      behaviorHints: {
        bingeGroup: id,
        notWebReady: false
      }
    };

    res.json({ streams: [stream] });
  } catch (err) {
    console.error("Stream error:", err);
    res.json({ streams: [] });
  }
});

app.listen(PORT, () => {
  console.log(`Smart Torrent Picker+ running on port ${PORT}`);
});
