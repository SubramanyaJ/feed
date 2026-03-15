<script>
  const API_ROOT = 'https://feed-backend-ashy.vercel.app/api/api';

let selector_bar_on = true;

let feeds = [];
let feedContent = [];
let currentFeedName = "";

function toggleList() {
	selector_bar_on = !selector_bar_on;
}

async function loadFeeds() {
  try {
    const res = await fetch('feeds.json');
	console.log(res);
    const data = await res.json();
    feeds = data;
  } catch (err) {
    console.error("Error loading feeds.json", err);
  }
}

async function loadFeedArticles(feed) {
  selector_bar_on = false;
  currentFeedName = feed.name;
  feedContent = [];

  const requestUrl = `${API_ROOT}?url=${encodeURIComponent(feed.url)}`;

  try {
    const res = await fetch(requestUrl);
    const data = await res.json();

    if (data.articles) {
      feedContent = data.articles.map(a => ({
        heading: a.title || "Untitled",
        data: a.description || a["content:encoded"] || a.content || "",
        link: a.link
      }));
    }
  } catch (err) {
    console.error("Error loading articles", err);
  }
}

function openArticle(link) {
  window.open(link, "_blank");
}

loadFeeds();
</script>

<div class="root">

{#if selector_bar_on}

<div class="header">

  <h3 style="color:#F0F0F0;">
    List of feeds
  </h3>
</div>

<div id="feedlist-container">
  {#each feeds as feed}
    <h3 class="dataheader" on:click={() => loadFeedArticles(feed)}>
      {feed.name}
    </h3>
  {/each}
</div>

{/if}

{#if !selector_bar_on}

<div class="header">
  <h3 on:click={toggleList}>
    {currentFeedName}
  </h3>
</div>

<div class="data-container">

  {#each feedContent as item}
    <div class="feed-content">
      <h3 class="dataheader-title" on:click={() => openArticle(item.link)}>
        {item.heading}
      </h3>
      <p class="data">
        {@html item.data}
      </p>
    </div>
  {/each}

</div>

{/if}

</div>
