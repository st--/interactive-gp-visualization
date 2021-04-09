<!-- Copyright (c) 2021 ST John -->
<script>
  import { onMount } from "svelte";
  import { randn } from "./mymath.js";
  import { vs, seed } from "./store.js";
  export let xsLength, numSamples;

  function resample(seed) {
    vs.set(randn(xsLength, numSamples, seed));
  }
  onMount(() => resample($seed));

  const resampleClick = (e) => {
    e.preventDefault(); // so page doesn't reload
    seed.set(Math.random());
    resample($seed);
  };
</script>

<div class="randomize-box">
  <label>
    Number of samples:
    <input
      type="number"
      bind:value={numSamples}
      min="0"
      max="10"
      on:change={() => resample($seed)}
    />
  </label>
  <button class="btn" on:click={resampleClick}>Resample</button>
</div>
