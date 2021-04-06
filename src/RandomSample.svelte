<script>
  import { onMount } from 'svelte';
  import { randn } from './mymath.js';
  import { vs } from './store.js';
  export let xsLength, numSamples;

  //vs = randn(xsLength, numSamples);
  function resample() {
    vs.set(randn(xsLength, numSamples));
  }
  onMount(resample);

  const resampleClick = (e) => {
    e.preventDefault();  // so page doesn't reload
    resample();
  }
</script>
<div class="randomize-box">
 <button class="btn" on:click={resampleClick}>Resample</button>
</div>
