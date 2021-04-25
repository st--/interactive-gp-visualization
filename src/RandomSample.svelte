<!-- Copyright (c) 2021 ST John -->
<script>
  import InputNumberSafely from "./InputNumberSafely.svelte";
  import { randn } from "./mymath.js";
  import { vs, us, seed1, seed2 } from "./store.js";
  export let xsLength, doAnimate;

  let numSamples = 3;

  $: vs.set(randn(xsLength, numSamples, $seed1));
  $: us.set(randn(xsLength, numSamples, $seed2));

  const resampleClick = (e) => {
    e.preventDefault(); // so page doesn't reload
    seed1.set(Math.random());
    seed2.set(Math.random());
  };
</script>

<div class="randomize-box">
  <label>
    Number of samples:
    <InputNumberSafely
      bind:value={numSamples}
      min="0"
      max="10"
      lowerBound={0}
    />
  </label>
  <button class="btn" on:click={resampleClick}>Resample</button>
  <button
    class="btn"
    on:click={(e) => {
      doAnimate = !doAnimate;
    }}
    >{#if doAnimate}Pause{:else}Play{/if}</button
  >
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
