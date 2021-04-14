<script>
  import Katex from "./Katex.svelte";
  export let name, formula, value, min, max, step;
</script>

<label>
  {name}
  <Katex math="{formula} =" />
  <input type="number" bind:value {min} {max} {step} />
  <input type="range" bind:value {min} {max} {step} />
</label>

<style>
  label {
    max-width: 500px;
    text-align: right;
  }
  input[type="number"] {
    width: 80px;
  }
</style>
