<script>
  import Katex from "./Katex.svelte";
  import InputNumberSafely from "./InputNumberSafely.svelte";
  export let name, formula, value, min, max, step, lowerBound;
</script>

<label>
  {name}
  <Katex math="{formula} =" />
  <InputNumberSafely
    bind:value
    {min}
    {max}
    {step}
    {lowerBound}
    style="width: 80px;"
  />
  <input type="range" bind:value {min} {max} {step} />
</label>

<style>
  label {
    max-width: 500px;
    text-align: right;
  }
  input[type="range"] {
    vertical-align: middle;
  }
</style>
