<script>
	import Tracker from './Tracker.svelte';
</script>

<main>
	<header class="pageHeader">

	<h1>|| BUBO MUSIC TRACKER || </h1>
	<p class="subtitle">A music tracker done wrong</p>

	</header>

	<article id="mainArticle">
		<Tracker />
	</article>

	<nav class="mainNav">
		<h2>Instructions</h2>
	</nav>

	<div class="siteParameters">Parameters</div>

	<footer class="pageFooter">Footer</footer>
</main>


<style>

    :root {
        --main-background: #11151C;
        --secondary-background: #212D40;
        --secondary-alt: #364156;
        --front-color-main: #7D4E57;
        --front-color-second: #D66853;
    }


	:global(body) {
		background: var(--secondary-alt);
	}

	.pageHeader > h1 {
		font-family: 'Courier New', Courier, monospace;
		font-weight: normal;
		font-size: 2vh;
		margin-top: 0;
	}

	.pageHeader > p {
		font-family: 'Courier New', Courier, monospace;
		font-weight: normal;
		font-size: 1.5vh;
	
	}

	main { 
		display: grid;
		grid-template-areas: 
			"header header header"
			"nav article ads"
			"footer footer footer";
		grid-template-rows: 3fr 1fr 70px;  
		grid-template-columns: 20% 1fr 15%;
		grid-row-gap: 10px;
		grid-column-gap: 10px;
		height: 100vh;
		/* margin: 0; */
		width: 100%;
		justify-content: center;
	}  

	header, footer, article, nav, div {
		padding: 1.2em;
		background: #212D40;
		border-radius: 5px;
		box-shadow: 0.5vh 0.5vh black;
		border: 2px black;
		color: white;
	}

	.pageHeader {
		grid-area: header;
		display: inline;
	}

	.pageFooter {
		grid-area: footer;
	}

	.mainArticle{ 
		grid-area: article;      
		display: inline;
		padding: 0px;
	}

	.mainNav { 
		grid-area: nav; 
	}

	.siteParameters {
		grid-area: ads; 
	} 

	/* Stack the layout on small devices/viewports. */
	@media all and (max-width: 1000px) {
		main { 
    		grid-template-areas: 
				"header"
				"article"
				"ads"
				"nav"
				"footer";
    		grid-template-rows: 2fr 1fr 70px 1fr 70px;  
    		grid-template-columns: 3fr;
		}
	}

	.mainNav > h2 {
		font-size: 1vw;
		font-family: 'Courier New', Courier, monospace;
	}

	.title_subtitle {
		display: inline;
	}

	.title_subtitle > p {
		font-size: 2vh;
	}
</style>
