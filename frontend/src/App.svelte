<script>
  let selector_bar_on = false;
  function toggleList() {
    selector_bar_on = !selector_bar_on;
  }
</script>

<div class="root">

  <!-- List of feeds -->
  {#if selector_bar_on}
  <div class="header_bar">
	<h3 on:click={toggleList}>
	  List of feeds
	</h3>
  </div>

  <h3 on:click={toggleList} class="dataheader">
	One
  </h3>
  
  {/if}


  <!-- Content of feeds -->
  {#if !selector_bar_on}
  <div class="header_bar">
    <h3 on:click={toggleList}>
	  Feed Name
	</h3>
  </div>

  
  <div class="feed-content">
	<h3 class="dataheader">
	  Feed Heading
	</h3>
	<p class="data">
	  Nullam eu ante vel est convallis dignissim.  Fusce suscipit, wisi nec facilisis facilisis, est dui fermentum leo, quis tempor ligula erat quis odio.  Nunc porta vulputate tellus.  Nunc rutrum turpis sed pede.  Sed bibendum.  Aliquam posuere.  Nunc aliquet, augue nec adipiscing interdum, lacus tellus malesuada massa, quis varius mi purus non odio.  Pellentesque condimentum, magna ut suscipit hendrerit, ipsum augue ornare nulla, non luctus diam neque sit amet urna.  Curabitur vulputate vestibulum lorem.  Fusce sagittis, libero non molestie mollis, magna orci ultrices dolor, at vulputate neque nulla lacinia eros.  Sed id ligula quis est convallis tempor.  Curabitur lacinia pulvinar nibh.  Nam a sapien.
	</p>
  </div>
  {/if}

</div>
