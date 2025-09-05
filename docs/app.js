// docs/app.js

const API_ROOT = 'https://feed-j1wdk7w1t-subramanyaj7-6620s-projects.vercel.app/api/feed';

// Your list of feeds here
const FEEDS = [
        { name: 'NYTimes Home', url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml' },
        { name: 'BBC World', url: 'http://feeds.bbci.co.uk/news/world/rss.xml' }
];

const feedListElem = document.getElementById('feed-list');
const articlesContainer = document.getElementById('articles-container');
const fontSelector = document.getElementById('fontFamily');

let openFeedIndex = null; // Currently expanded feed index

// Set initial font family from selector
function updateFontFamily() {
        document.body.style.fontFamily = fontSelector.value;
}
fontSelector.addEventListener('change', () => {
        updateFontFamily();
});
updateFontFamily();

// Render list of feeds with article counts
function renderFeedList() {
        feedListElem.innerHTML = '';

        FEEDS.forEach((feed, idx) => {
                const bar = document.createElement('div');
                bar.className = 'feed-bar';
                bar.tabIndex = 0;
                bar.setAttribute('role', 'button');
                bar.setAttribute('aria-expanded', 'false');
                bar.setAttribute('aria-controls', `feed-articles-${idx}`);
                bar.dataset.idx = idx;

                const nameSpan = document.createElement('span');
                nameSpan.textContent = feed.name;
                bar.appendChild(nameSpan);

                const countSpan = document.createElement('span');
                countSpan.className = 'article-count';
                countSpan.textContent = '...'; // Loading placeholder
                bar.appendChild(countSpan);

                // Fetch article count
                const requestUrl = `${API_ROOT}?url=${encodeURIComponent(feed.url)}`;
                console.log("Fetching count from:", requestUrl);
                fetch(requestUrl)
                        .then(res => res.json())
                        .then(data => {
                                countSpan.textContent = data.articles ? data.articles.length : '0';
                        })
                        .catch(() => {
                                countSpan.textContent = '?';
                        });

                // Click or keyboard activation
                bar.addEventListener('click', () => {
                        toggleFeed(idx);
                });
                bar.addEventListener('keypress', e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                toggleFeed(idx);
                        }
                });

                feedListElem.appendChild(bar);
        });
}

// Toggle feed expansion
function toggleFeed(idx) {
        if (openFeedIndex === idx) {
                // Collapse current
                articlesContainer.innerHTML = '';
                setAriaExpanded(idx, false);
                openFeedIndex = null;
        } else {
                // Expand new
                loadAndRenderArticles(idx);
                setAriaExpanded(idx, true);
                if (openFeedIndex !== null) setAriaExpanded(openFeedIndex, false);
                openFeedIndex = idx;
        }
}

// Set aria-expanded on feed bar
function setAriaExpanded(idx, expanded) {
        const elements = document.querySelectorAll('.feed-bar');
        if (elements[idx]) {
                elements[idx].setAttribute('aria-expanded', expanded);
        }
}

// Load articles and render them
function loadAndRenderArticles(idx) {
        articlesContainer.innerHTML = '<p>Loading articles…</p>';
        const requestUrl = `${API_ROOT}?url=${encodeURIComponent(FEEDS[idx].url)}`;
        console.log("Fetching articles from:", requestUrl);
        fetch(requestUrl)
                .then(res => res.json())
                .then(data => {
                        renderArticles(data.articles);
                })
                .catch(err => {
                        articlesContainer.innerHTML = '<p style="color:#ff5555;">Error loading articles.</p>';
                        console.error(err);
                });
}

// Render list of articles
function renderArticles(articles) {
        articlesContainer.innerHTML = '';
        if (!articles || articles.length === 0) {
                articlesContainer.innerHTML = '<p>No articles found.</p>';
                return;
        }

        const list = document.createElement('div');
        list.className = 'article-list';

        articles.forEach(article => {
                const art = document.createElement('article');
                art.className = 'article';

                // Title with link (opens in new tab)
                const h3 = document.createElement('h3');
                const link = document.createElement('a');
                link.href = article.link || '#';
                link.textContent = article.title || 'Untitled';
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                h3.appendChild(link);
                art.appendChild(h3);

                // Image if available
                if (article.imageUrl) {
                        const img = document.createElement('img');
                        img.src = article.imageUrl;
                        img.alt = article.title || 'Article image';
                        art.appendChild(img);
                }

                // Summary or content
                const contentDiv = document.createElement('div');
                contentDiv.className = 'article-content';
                contentDiv.innerHTML = article.description || article['content:encoded'] || article.content || '';
                art.appendChild(contentDiv);

                list.appendChild(art);
        });

        articlesContainer.appendChild(list);
}

// Initialize
window.onload = () => {
        renderFeedList();
};
