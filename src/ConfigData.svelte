<script>
  import Katex from "./Katex.svelte";
  import ParameterSlider from "./ParameterSlider.svelte";
  export let noiseScale, selectedKernel, kernelChoices;

  let noiseVarianceProps = {
    name: "standard deviation",
    formula: "\\sigma_\\text{noise}",
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
  <Katex math="k(x, x') = {selectedKernel.formula}" />

  {#each selectedKernel.parameters as parameter}
    <ParameterSlider bind:value={parameter.value} {...parameter} />
  {/each}

  Likelihood:
  <label
    ><input type="radio" bind:group={useLikelihood} value={false} />noise-free
    observations</label
  >
  <label
    ><input type="radio" bind:group={useLikelihood} value={true} />observations
    with Gaussian noise, <Katex
      math={"p(y\\, | \\,f(x)) = \\mathcal{N}(f(x), \\sigma_\\text{noise}^2)"}
    /></label
  >
  {#if useLikelihood}
    <ParameterSlider bind:value={noiseScaleInternal} {...noiseVarianceProps} />
  {/if}
</div>
