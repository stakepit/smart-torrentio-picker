const { createServer } = require('http');
const { parse } = require('url');

createServer((req, res) => {
    const { pathname } = parse(req.url, true);
    if (pathname === '/manifest.json') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            "id": "smart-torrentio-picker",
            "version": "1.0.0",
            "type": "movie",
            "name": "Smart Torrentio Picker",
            "description": "Automatically selects the best torrent based on user settings.",
            "catalogs": [
                {
                    "type": "movies",
                    "id": "movies",
                    "name": "Movies"
                }
            ],
            "resources": ["catalog", "stream"],
            "logo": "https://yourlogo.com/logo.png"
        }));
    } else {
        res.statusCode = 404;
        res.end();
    }
}).listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});
