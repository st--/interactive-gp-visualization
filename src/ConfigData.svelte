<script>
  export let noiseScale;
</script>

<label>
  Standard deviation of the Gaussian likelihood (noise):
  <input type="number" bind:value={noiseScale} step="0.1" /><input
    type="range"
    bind:value={noiseScale}
    min="0.0"
    max="3.0"
    step="0.1"
  />
</label>
