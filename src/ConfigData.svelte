<script>
  import ParameterSlider from "./ParameterSlider.svelte";
  export let noiseScale, selectedKernel, kernelChoices;

  let noiseVarianceProps = {
    name: "standard deviation",
    min: 0.0,
    max: 3.0,
    step: 0.1,
  };
</script>

Gaussian noise likelihood:
<ParameterSlider bind:value={noiseScale} {...noiseVarianceProps} />

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
