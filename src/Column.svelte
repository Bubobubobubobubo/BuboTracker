<script>
    export let nbSteps = 12;
</script>

<tracker_column>
    {#each Array.from(Array(nbSteps).keys()) as n}

        {#if (n % 4 == 0)}
            <span class="highlightLine">
                <input maxlength="8" type="text" class="highlightText">
            </span>
        {:else}
            <span class="normalLine">
                <input maxlength="8" type="text" class="normalText">
            </span>
        {/if}
    {/each}
</tracker_column>

<style>

    :root {
        --main-background: #11151C;
        --secondary-background: #212D40;
        --secondary-alt: #364156;
        --front-color-main: #7D4E57;
        --front-color-second: #D66853;
    }

    input:focus,
    select:focus,
    textarea:focus,
    button:focus {
        outline: none;
    }


    input {
        font-family: 'Courier New', Courier, monospace;
        border: none;
        font-size: 2vh;
        color: white;
        max-width: 6vw;
        text-align: center;
    }
    
    .highlightText {
        background: var(--secondary-alt);
    }

    .normalText {
        background: var(--secondary-background);
    }

    .highlightLine {
        background: var(--secondary-alt);
        color: white;
    }

    .normalLine {
        background: var(--secondary-background);
        color: white;
    }

    span {
        display: block;
        text-align: center;
        margin: 5px 2px;
        border: 1px solid black;
    }
    
    .highlightNum {
        background: var(--secondary-alt);
        color: white;
    }

    .normalNum {
        background: var(--secondary-background);
        color: white;
    }


</style>