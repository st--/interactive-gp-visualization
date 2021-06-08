<!-- Copyright (c) 2021 ST John -->
<script>
  import Katex from "./Katex.svelte";
  import ParameterSlider from "./ParameterSlider.svelte";
  export let noiseScale,
    selectedKernel,
    kernelChoices,
    selectedKernel2,
    kernelChoices2,
    kernelCombination;

  let noiseScaleProps = {
    name: "standard deviation",
    formula: "\\sigma_\\text{noise}",
    min: 0.0,
    max: 4.0,
    step: 0.01,
    lowerBound: 0.0,
  };
  let noiseScaleInternal = noiseScale;
  let useLikelihood = true;
  $: noiseScale = useLikelihood ? noiseScaleInternal : 0.0;
</script>

<div>
  <div class="flexcontainer">
    <div class="flexelement">
      <strong>Kernel:</strong>
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
    </div>

    <div class="flexelement">
      {#if kernelCombination === ""}
        <button
          on:click={(_event) => {
            kernelCombination = "+";
          }}>+</button
        >/<button
          on:click={(_event) => {
            kernelCombination = "*";
          }}>*</button
        >
      {:else}
        <strong>{kernelCombination}</strong>
        <select bind:value={selectedKernel2}>
          {#each kernelChoices2 as choice}
            <option value={choice}>
              {choice.description}
            </option>
          {/each}
        </select>
        <Katex math="k(x, x') = {selectedKernel2.formula}" />
        <button
          on:click={(_event) => {
            kernelCombination = "";
          }}>X</button
        >

        {#each selectedKernel2.parameters as parameter}
          <ParameterSlider bind:value={parameter.value} {...parameter} />
        {/each}
      {/if}
    </div>

    <div class="flexelement">
      <strong>Likelihood:</strong>
      <label
        ><input
          type="radio"
          bind:group={useLikelihood}
          value={false}
        />noise-free observations</label
      >
      <label
        ><input
          type="radio"
          bind:group={useLikelihood}
          value={true}
        />observations with Gaussian noise, <Katex
          math={"p(y\\, | \\,f(x)) = \\mathcal{N}(f(x), \\sigma_\\text{noise}^2)"}
        /></label
      >
      {#if useLikelihood}
        <ParameterSlider bind:value={noiseScaleInternal} {...noiseScaleProps} />
      {/if}
    </div>
  </div>
</div>

<style>
  input[type="radio"] {
    margin-right: 5px;
  }
  .flexcontainer {
    display: flex;
    flex-flow: row wrap;
  }
  .flexelement {
    margin-right: 1em;
  }
</style>
