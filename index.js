const axios = require('axios');

const getBestTorrent = (quality, maxSize) => {
  // Logic for picking the best torrent based on user preferences
  // This will interact with the Torrentio API
  return axios.get(`https://torrentio.api/${quality}?maxSize=${maxSize}`)
    .then(response => {
      const torrents = response.data.torrents;
      return torrents.sort((a, b) => b.seeders - a.seeders)[0];
    });
};

module.exports = {
  getBestTorrent
};
