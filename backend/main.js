const express = require('express');
const feedHandler = require('./api/api');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());

app.get('/api/feed', (req, res) => {
    feedHandler(req, res);
});

// handle OPTIONS for CORS
app.options('/api/feed', (req, res) => {
    feedHandler(req, res);
});

app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
});
