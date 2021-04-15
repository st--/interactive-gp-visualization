<script>
  import Katex from "./Katex.svelte";

  export let plotProps, num_grid;
</script>

<label
  ><input type="checkbox" bind:checked={plotProps.mean} />Plot mean <Katex
    math={"\\mathbb{E}[f(x)]"}
  /></label
>
<label
  ><input type="checkbox" bind:checked={plotProps.confidence} />Plot <Katex
    math="\pm \sigma(x)"
  /> and <Katex math="\pm 2 \sigma(x)" /> confidence bands</label
>
<label
  ><input type="checkbox" bind:checked={plotProps.samples} />Plot samples <Katex
    math="\sim f(\cdot)"
  /></label
>
<label
  ><input type="checkbox" bind:checked={plotProps.marginals} />Plot marginal
  distributions of <Katex math="f(x_1), \, f(x_2)" /></label
>
<div class="advanced">
  <label>
    Number of evaluation points: {num_grid}
    <input type="range" bind:value={num_grid} min="10" max="500" step="5" />
  </label>
</div>
