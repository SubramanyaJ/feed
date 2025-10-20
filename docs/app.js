const API_ROOT = 'https://feed-j1wdk7w1t-subramanyaj7-6620s-projects.vercel.app/api/feed';

let FEEDS = [];

// Load feeds from feeds.json
fetch('feeds.json')
    .then(res => res.json())
    .then(data => {
        FEEDS = data;
        renderFeedList();
    })
    .catch(err => {
        console.error('Error loading feeds.json', err);
    });

const feedListElem = document.getElementById('feed-list');
const articlesContainer = document.getElementById('articles-container');

// Sidebar toggle
const sidebar = document.getElementById('sidebar');
document.getElementById('menu-toggle').addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
});

// Render feed list
function renderFeedList() {
    feedListElem.innerHTML = '';

    FEEDS.forEach((feed, idx) => {
        const bar = document.createElement('div');
        bar.className = 'feed-bar';
        bar.tabIndex = 0;
        bar.dataset.idx = idx;

        const nameSpan = document.createElement('span');
        nameSpan.textContent = feed.name;
        bar.appendChild(nameSpan);

        const countSpan = document.createElement('span');
        countSpan.className = 'article-count';
        countSpan.textContent = '...';
        bar.appendChild(countSpan);

        const requestUrl = `${API_ROOT}?url=${encodeURIComponent(feed.url)}`;
        fetch(requestUrl)
            .then(res => res.json())
            .then(data => {
                countSpan.textContent = data.articles ? data.articles.length : '0';
            })
            .catch(() => {
                countSpan.textContent = '?';
            });

        bar.addEventListener('click', () => {
            loadAndRenderArticles(idx);
        });

        feedListElem.appendChild(bar);
    });
}

// Load and render articles
function loadAndRenderArticles(idx) {
    document.getElementById('feed-title').textContent = FEEDS[idx].name;
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

// Render articles (no images)
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

        const h3 = document.createElement('h3');
        h3.textContent = article.title || 'Untitled';
        h3.style.cursor = 'pointer';
        art.appendChild(h3);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'article-content';
        contentDiv.innerHTML = article.description || article['content:encoded'] || article.content || '';
        art.appendChild(contentDiv);

        /**
         * TODO: Fix this
         * I need to fetch the complete article data
         * And then render it inside my own page.
         * The question is whether I spawn a different page for it
         * or expand the feed item.
         */
        art.addEventListener('click', () => {
            window.open(article.link, '_blank');
        });

        list.appendChild(art);
    });

    articlesContainer.appendChild(list);
}