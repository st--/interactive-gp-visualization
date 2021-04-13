<script>
  import ParameterSlider from "./ParameterSlider.svelte";
  export let noiseScale, selectedKernel, kernelChoices;

  let noiseVarianceProps = {
    name: "standard deviation of noise",
    min: 0.0,
    max: 3.0,
    step: 0.1,
  };
  let noiseScaleInternal = noiseScale;
  let useLikelihood = true;
  $: noiseScale = useLikelihood ? noiseScaleInternal : 0.0;
</script>

<div>
  Kernel:
  <select bind:value={selectedKernel}>
    {#each kernelChoices as choice}
      <option value={choice}>
        {choice.description}
      </option>
    {/each}
  </select>

  {#each selectedKernel.parameters as parameter}
    <ParameterSlider bind:value={parameter.value} {...parameter} />
  {/each}

  Likelihood:
  <label
    ><input type="checkbox" bind:checked={useLikelihood} />observations with
    Gaussian noise</label
  >
  {#if useLikelihood}
    <ParameterSlider bind:value={noiseScaleInternal} {...noiseVarianceProps} />
  {/if}
</div>
