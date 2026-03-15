const fetch = require('node-fetch');
const { XMLParser } = require('fast-xml-parser');
const he = require('he');

const xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
});

function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function decode(text) {
    if (!text) return "";
    return he.decode(text);
}

function normalizeArticle(item) {

    let link = "";

    // RSS
    if (typeof item.link === "string") {
        link = item.link;
    }

    // Atom
    if (!link && Array.isArray(item.link)) {
        const alt = item.link.find(l => l.rel === "alternate") || item.link[0];
        if (alt && alt.href) link = alt.href;
    }

    if (!link && item.link && item.link.href) {
        link = item.link.href;
    }

    const title = decode(item.title || "Untitled");

    const description = decode(
        item.description ||
        item.summary ||
        item['content:encoded'] ||
        item.content ||
        ""
    );

    const pubDate =
        item.pubDate ||
        item.published ||
        item.updated ||
        "";

    return {
        title,
        link,
        description,
        pubDate
    };
}

module.exports = async (req, res) => {

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

    try {
        url = decodeURIComponent(url);
    } catch (_) {}

    if (url.startsWith('http://')) {
        url = url.replace('http://', 'https://');
    }

    try {

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; RSS-Proxy/1.0)',
                'Accept': 'application/rss+xml, application/xml, text/xml'
            },
            redirect: 'follow'
        });

        if (!response.ok) {
            res.status(500).json({
                error: `Failed to fetch feed: ${response.status} ${response.statusText}`
            });
            return;
        }

        const xml = await response.text();
        const jsonData = xmlParser.parse(xml);

        let items = [];

        if (jsonData.rss?.channel?.item) {
            items = jsonData.rss.channel.item;
        }

        if (jsonData.feed?.entry) {
            items = jsonData.feed.entry;
        }

        if (!Array.isArray(items)) {
            items = [items];
        }

        const articles = items
            .filter(Boolean)
            .map(normalizeArticle);

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({ articles });

    } catch (err) {
        res.status(500).json({
            error: "Server error",
            details: err.message
        });
    }
};
