<!-- Copyright (c) 2021 ST John -->
<script>
  import { randn } from "./mymath.js";
  import { vs, seed } from "./store.js";
  export let xsLength;

  let numSamples = 3;

  $: vs.set(randn(xsLength, numSamples, $seed));

  const resampleClick = (e) => {
    e.preventDefault(); // so page doesn't reload
    seed.set(Math.random());
  };
</script>

<div class="randomize-box">
  <label>
    Number of samples:
    <input type="number" bind:value={numSamples} min="0" max="10" />
  </label>
  <button class="btn" on:click={resampleClick}>Resample</button>
</div>

<style>
  .randomize-box {
    display: flex;
    align-items: center;
  }
  input[type="number"] {
    width: 50px;
  }
</style>
