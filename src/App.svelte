<script>
	import Tracker from './Tracker.svelte';

	let MIDI = {'devices': []};

    var midi = null;
    function onMIDISuccess(midiAccess) {
        console.log("MIDI Ready!");
		MIDI.devices.push(midiAccess);
    }
    function onMIDIFailure(msg) {
        console.log("Failed to get MIDI access - " + msg);
    }

    navigator.requestMIDIAccess().then(
        onMIDISuccess, onMIDIFailure);

	console.log(MIDI.devices);
	// for (let device in MIDI.devices[0].ou);

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
		<p>This is a simple MIDI Tracker using WebMIDI. You can select the number of steps and tracks, pick a tempo, and play simple patterns. I plan to cover all the basic MIDI messages.</p>
		<p>The <em>T:table</em> command allows you to switch between tables, allowing you to switch scenes.</p>
		<p>The <em>T:direction</em> command allow you to pick a direction for the tracker: <em>normal</em>, <em>reverse</em>, <em>random</em>,<em>drunk</em>, etc...</p>
	</nav>

	<div class="siteParameters">

		<h2>Parameters</h2>

		<h3>MIDI Device</h3>

		<p>Pick MIDI Device: </p>
		<ul class="MIDIMenu">
			<li>Test</li>
			<li>Test</li>
			<li>Test</li>
		</ul>

		<h3>Transport</h3>
		<ul class="MIDIMenu">
			<li>Play</li>
			<li>Pause</li>
			<li>Stop</li>
		</ul>

	</div>

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

	main {
		font-family: 'Courier New', Courier, monospace;
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

	.mainNav { 
		grid-area: nav; 
	}

	.siteParameters {
		grid-area: ads; 
	} 

	.mainNav > h2 {
		font-size: 1vw;
		font-family: 'Courier New', Courier, monospace;
	}

	.MIDIMenu {
		margin: 0px 0px;
		padding: 0px 0px;
	}

	.MIDIMenu li {
		background-color: var(--front-color-second);
		margin-left: 0px;
		color: white;
		display: block;
		padding: 12px;
		text-decoration: none;
	}

	.MIDIMenu li:hover {
		background-color: var(--front-color-main);
	}

	.MIDIMenu li:active {
		background-color: var(--secondary-alt);
		color: white;
	}

	.siteParameters h2 {
		font-family: 'Courier New', Courier, monospace;
		padding-bottom: 1vh;
		border-bottom: 2px solid white;
	}

	.siteParameters h3 {
		font-family: 'Courier New', Courier, monospace;
		padding-bottom: 1vh;
		border-bottom: 2px solid white;
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

</style>
