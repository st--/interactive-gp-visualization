<!-- Copyright (c) 2021 ST John -->
<script lang="ts">
  import InputNumberSafely from "./InputNumberSafely.svelte";
  import { randn } from "./mymath";
  import { vs, us } from "./store";
  export let xsLength: number;

  let numSamples = 3;
  let seed1 = 0.1;
  let seed2 = 0.2;

  $: vs.set(randn(xsLength, numSamples, seed1));
  $: us.set(randn(xsLength, numSamples, seed2));

  const resampleClick = (event: MouseEvent) => {
    event.preventDefault(); // so page doesn't reload
    seed1 = Math.random();
    seed2 = Math.random();
  };
</script>

<div class="randomize-box">
  <label for="numSamplesInput">
    Number of samples:
    <InputNumberSafely
      bind:value={numSamples}
      min={0}
      max={10}
      lowerBound={0}
      integer
      style="width: 50px;"
      id="numSamplesInput"
    />
  </label>
  <button class="btn" on:click={resampleClick}>Resample</button>
</div>

<style>
  .randomize-box {
    display: flex;
    align-items: center;
  }
</style>
