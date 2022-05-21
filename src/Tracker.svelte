<script>
    import Column from './Column.svelte';
    import NumberingColumn from './NumberingColumn.svelte';
    let nbTracks = 4;
    let nbSteps = 12;
    let table = 'default';

</script>

<main>
    <div class="tracker_modifiers">
        <p class="tracker_text">Steps : <input type="number" class="step_modifier" bind:value={nbSteps}></p>
        <p class="tracker_text">Tracks: <input type="number" class="track_modifier" bind:value={nbTracks}></p>
        <p class="tracker_text">Table: <input type="text" class="table_modifier" bind:value={table}></p>
        <p class="text_hint">(Enter to change)</p>
    </div>

    <tracker_zone>
        {#each [...Array(nbTracks)] as track}
            <Column {nbSteps} />
        {/each}
    </tracker_zone>
</main>

<style>

    :root {
        --main-background: #11151C;
        --secondary-background: #212D40;
        --secondary-alt: #364156;
        --front-color-main: #7D4E57;
        --front-color-second: #D66853;
    }



    .tracker_modifiers {
        justify-content: center;
        display: inline;
        padding: 10px;
        margin: 0 10px;
        text-align: center;
    }

  

    .tracker_text {
        display: inline;
        font-family:'Courier New', Courier, monospace;
        font-size: 16px;
    }

    .step_modifier, .track_modifier, .table_modifier {
        justify-content: center;
        font-family:'Courier New', Courier, monospace;
        width: 3vw;
        font-size: 16px;
        display: inline;
        border: none;
        background: var(--secondary-background); 
        color: white;
    }

    /* Hiding arrows */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    /* Firefox */
    input[type=number] {
        -moz-appearance: textfield;
    }

    input:focus,
    select:focus,
    textarea:focus,
    button:focus {
        outline: none;
    }

    .table_modifier {
        width: 5vw;
        font-size: 16px;
    }

    main {
        display: block;
    }

    tracker_zone {
        display: grid;
        grid-template-rows: repeat(1fr, 8);
        grid-auto-flow: column;
        gap: 1vh 0vw;
    }

    @media only screen and (max-width: 800px) {

        .tracker_modifiers {
            display: grid;
            padding: 0px; margin: 0 10px;
            text-align: left;
            justify-content: left;
        }

        .tracker_text {
            justify-content: left;
            text-align: left;
            margin: 0 0;
        }
        .step_modifier, .track_modifier, .table_modifier {
            width: 3vh;
        }

        .text_hint {
            display: none;
        }

    }
</style>