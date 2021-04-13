<script>
  export let noiseScale, selectedKernel, kernelChoices;
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
<select bind:value={selectedKernel}>
  {#each kernelChoices as choice}
    <option value={choice}>
      {choice.description}
    </option>
  {/each}
</select>
{#each selectedKernel.parameters as parameter}
  <label>
    {parameter.name}:
    <input
      type="number"
      bind:value={parameter.value}
      step={parameter.step}
    /><input
      type="range"
      bind:value={parameter.value}
      min={parameter.min}
      max={parameter.max}
      step={parameter.step}
    />
  </label>
{/each}
