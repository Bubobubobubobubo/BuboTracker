<script>
    export let nbSteps;
</script>

<numbering_column>
    {#each Array.from(Array(nbSteps).keys()) as num}
        {#if (num % 4) == 0}
            <span class="highlightNum">{num + 1}</span>
        {:else}
            <span class="normalNum">{num + 1}</span>
        {/if}
    {/each}
</numbering_column>

<style>

    :root {
        --main-background: #11151C;
        --secondary-background: #212D40;
        --secondary-alt: #364156;
        --front-color-main: #7D4E57;
        --front-color-second: #D66853;
    }
    
    span {
        font-family: 'Courier New', Courier, monospace;
        display: block;
        font-size: 1.12vw;
        text-align: left;
        padding-left: 5px;
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