// server/api/feed.js
const fetch = require('node-fetch');
const { XMLParser } = require('fast-xml-parser');

const xmlParser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
});

function setCorsHeaders(res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
        // Handle OPTIONS preflight requests
        if (req.method === 'OPTIONS') {
                setCorsHeaders(res);
                res.status(204).end();
                return;
        }

        setCorsHeaders(res);

        let { url } = req.query;
        if (!url) {
                res.status(400).json({ error: "Missing 'url' query parameter" });
                return;
        }

        // Ensure url is decoded and normalized
        try {
                url = decodeURIComponent(url);
        } catch (_) {
                // if decoding fails, leave as is
        }
        if (url.startsWith('http://')) {
                url = url.replace('http://', 'https://');
        }
        const feedUrl = url;

        try {
                const response = await fetch(feedUrl, {
                        headers: {
                                'User-Agent': 'Mozilla/5.0 (compatible; RSS-Proxy/1.0)',
                                'Accept': 'application/rss+xml, application/xml, text/xml',
                        },
                        redirect: 'follow',
                });

                if (response.status === 401) {
                        res.status(401).json({ error: "Unauthorized access when fetching feed URL" });
                        return;
                }

                if (!response.ok) {
                        res.status(500).json({ error: `Failed to fetch feed: ${response.status} ${response.statusText}` });
                        return;
                }

                const xml = await response.text();
                const jsonData = xmlParser.parse(xml);

                let articles = [];
                if (jsonData.rss && jsonData.rss.channel && jsonData.rss.channel.item) {
                        articles = jsonData.rss.channel.item;
                } else if (jsonData.feed && jsonData.feed.entry) {
                        articles = jsonData.feed.entry;
                }

                articles = articles.map((item) => {
                        let imageUrl = "";
                        if (item['media:content'] && item['media:content'].url) {
                                imageUrl = item['media:content'].url;
                        } else if (item.enclosure && item.enclosure.url) {
                                imageUrl = item.enclosure.url;
                        } else if (item.description) {
                                const match = item.description.match(/<img[^>]+src=["']([^"']+)["']/);
                                if (match) imageUrl = match[1];
                        }
                        item.imageUrl = imageUrl;
                        return item;
                });

                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ articles });
        } catch (err) {
                res.status(500).json({ error: 'Server error', details: err.message });
        }
};
