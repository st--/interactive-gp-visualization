<script>
  export let plotProps, num_grid;
</script>

<label><input type="checkbox" bind:checked={plotProps.mean} />Plot mean</label>
<label
  ><input type="checkbox" bind:checked={plotProps.confidence} />Plot 1 and 2
  sigma confidence</label
>
<label
  ><input type="checkbox" bind:checked={plotProps.samples} />Plot samples</label
>
<label
  ><input type="checkbox" bind:checked={plotProps.marginals} />Plot marginals</label
>
<div class="advanced">
  <label>
    Number of evaluation points: {num_grid}
    <input type="range" bind:value={num_grid} min="10" max="100" step="5" />
  </label>
</div>
