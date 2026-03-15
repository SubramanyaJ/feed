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

function extractImage(item, html) {

    if (item.enclosure?.url && item.enclosure?.type?.startsWith("image")) {
        return item.enclosure.url;
    }

    if (Array.isArray(item.enclosure)) {
        const img = item.enclosure.find(e => e.url && e.type?.startsWith("image"));
        if (img) return img.url;
    }

    if (item["media:thumbnail"]?.url) {
        return item["media:thumbnail"].url;
    }

    if (Array.isArray(item["media:thumbnail"])) {
        const thumb = item["media:thumbnail"][0];
        if (thumb?.url) return thumb.url;
    }

    if (item["media:content"]?.url) {
        return item["media:content"].url;
    }

    if (Array.isArray(item["media:content"])) {
        const media = item["media:content"].find(m => m.url);
        if (media) return media.url;
    }

    if (html) {
        const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (match) return he.decode(match[1]);
    }

    return "";
}

function stripImageTags(html) {
    if (!html) return "";
    return html.replace(/<img[^>]*>/gi, "");
}

function normalizeArticle(item) {

    let link = "";

    if (typeof item.link === "string") {
        link = item.link;
    }

    if (!link && Array.isArray(item.link)) {
        const alt = item.link.find(l => l.rel === "alternate") || item.link[0];
        if (alt && alt.href) link = alt.href;
    }

    if (!link && item.link && item.link.href) {
        link = item.link.href;
    }

    const title = decode(item.title || "Untitled");

    const rawDescription =
        item.description ||
        item.summary ||
        item['content:encoded'] ||
        item.content ||
        "";

    const image = extractImage(item, rawDescription);

    const description = decode(stripImageTags(rawDescription));

    const pubDate =
        item.pubDate ||
        item.published ||
        item.updated ||
        "";

    return {
        title,
        link,
        image,
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
