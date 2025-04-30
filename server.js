const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Make sure to install node-fetch

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Enable Cross-Origin Resource Sharing (CORS)

const getTorrents = async (type, id) => {
    // Define public sources for torrents (RARBG, YTS, EZTV, ThePirateBay)
    const publicSources = [
        { name: 'RARBG', url: `https://api.rarbg.to/torrents.php?category=movies&imdb_id=${id}` },
        { name: 'YTS', url: `https://yts.mx/api/v2/list_movies.json?query_term=${id}` },
        { name: 'EZTV', url: `https://eztv.re/api/episode?id=${id}` },
        { name: 'ThePirateBay', url: `https://api.piratebay.org/torrents/${id}` }
    ];

    try {
        // Fetch torrents from all sources
        const torrents = await Promise.all(
            publicSources.map(source =>
                fetch(source.url)
                    .then(res => res.json())
                    .then(data => ({
                        source: source.name,
                        torrents: data.torrents || []
                    }))
            )
        );

        return torrents;
    } catch (error) {
        console.error('Error fetching torrents:', error);
        return [];
    }
};

// Endpoint to search for torrents
app.get('/search', async (req, res) => {
    const { type, id } = req.query;

    if (!type || !id) {
        return res.status(400).json({ error: 'Missing "type" or "id" query parameters' });
    }

    const torrentsData = await getTorrents(type, id);

    // Flatten the list of torrents and prioritize based on quality and number of seeders
    const torrents = torrentsData
        .flatMap(sourceData => sourceData.torrents)
        .filter(torrent => {
            return (
                (torrent.quality === '720p' && torrent.seeders >= 30 && torrent.size <= 800000000) ||
                (torrent.quality === '1080p' && torrent.seeders >= 50 && torrent.size <= 1500000000)
            );
        })
        .sort((a, b) => b.seeders - a.seeders) // Sort by seeders, descending
        .slice(0, 1); // Only show the top result (best torrent)

    // Return the best option
    res.json({
        name: 'SmarT-Autoplay',
        url: torrents.length > 0 ? torrents[0].magnet : null, // Return the magnet link of the best torrent
        description: 'Best source found',
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
