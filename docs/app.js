const API_ROOT = 'https://feed-j1wdk7w1t-subramanyaj7-6620s-projects.vercel.app/api/feed';

let FEEDS = [];
const feedListElem = document.getElementById('feed-list');
const articlesContainer = document.getElementById('articles-container');
let openFeedIndex = null;

// Load feeds.json dynamically
async function loadFeeds() {
        try {
                const res = await fetch('feeds.json');
                FEEDS = await res.json();
                renderFeedList();
        } catch (err) {
                console.error("Failed to load feeds.json", err);
        }
}

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

// Render list of articles (no images anymore)
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

                // Summary or content only
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
        loadFeeds();
};
