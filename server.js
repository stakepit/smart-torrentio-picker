const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files (if any)
app.use(express.static('public'));

// Your route to handle Stremio's manifest
app.get('/manifest.json', (req, res) => {
  res.json({
    id: 'com.example.addon',
    version: '1.0.0',
    types: ['movie'],
    name: 'Smart Torrentio Picker',
    description: 'A smart torrent picker with the best seeders.',
    background: 'https://your-logo-url.com/logo.png',
    logo: 'https://your-logo-url.com/logo.png',
    resources: [
      {
        type: 'movie',
        id: 'some-movie-id',
        title: 'Example Movie',
        url: 'https://your-torrent-url.com/torrent',
        subtitle: '720p',
        seeders: 1000
      }
    ]
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
