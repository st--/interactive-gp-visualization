<!-- Copyright (c) 2021 ST John -->
<script lang="ts">
  import Katex from "./Katex.svelte";
  import ParameterSlider from "./ParameterSlider.svelte";
  import type { KernelSelection } from "./kernels";
  export let noiseScale: number,
    kernelSelection: KernelSelection,
    kernelChoices: KernelSelection[],
    kernelSelection2: KernelSelection,
    kernelChoices2: KernelSelection[],
    kernelCombination: string;

  let noiseScaleProps = {
    name: "standard deviation",
    formula: "\\sigma_\\text{noise}",
    min: 0.0,
    max: 4.0,
    step: 0.01,
    lowerBound: 0.0,
  };
  let noiseScaleInternal = noiseScale;
  let useLikelihood = 1; // input radio's typing doesn't play along with boolean
  $: noiseScale = useLikelihood ? noiseScaleInternal : 0.0;

  const kernelCombinationInfo = {
    "": { header: "Kernel", symbol: "" },
    "+": { header: "Sum kernel", symbol: "&plus;" },
    "*": { header: "Product kernel", symbol: "&times;" },
  };

  $: kernelHeader = kernelCombinationInfo[kernelCombination].header;
  $: kernelCombinationSymbol = kernelCombinationInfo[kernelCombination].symbol;
</script>

<div>
  <div class="flexcontainer">
    <div class="flexelement">
      <strong>{kernelHeader}:</strong>
      <select bind:value={kernelSelection}>
        {#each kernelChoices as choice}
          <option value={choice}>
            {choice.description}
          </option>
        {/each}
      </select>
      <Katex math="k(x, x') = {kernelSelection.formula}" />

      {#each kernelSelection.parameters as parameter}
        <ParameterSlider bind:value={parameter.value} {...parameter} />
      {/each}
    </div>

    <div class="flexelement">
      {#if kernelCombination === ""}
        <!-- simple kernel -->
        <div style="margin-right: 1em;">
          <button
            on:click={(_event) => {
              kernelCombination = "+";
            }}
            title="add second kernel"><strong>&plus;</strong></button
          >/<button
            on:click={(_event) => {
              kernelCombination = "*";
            }}
            title="multiply by second kernel"><strong>&times;</strong></button
          >
        </div>
      {:else}
        <strong style="margin-right: 1em;"
          >{@html kernelCombinationSymbol}</strong
        >
        <select bind:value={kernelSelection2}>
          {#each kernelChoices2 as choice}
            <option value={choice}>
              {choice.description}
            </option>
          {/each}
        </select>
        <Katex math="k(x, x') = {kernelSelection2.formula}" />
        <button
          on:click={(_event) => {
            kernelCombination = "";
          }}
          title="remove second kernel"><i class="gg-trash" /></button
        >

        {#each kernelSelection2.parameters as parameter}
          <ParameterSlider bind:value={parameter.value} {...parameter} />
        {/each}
      {/if}
    </div>

    <div class="flexelement">
      <strong>Likelihood:</strong>
      <label
        ><input type="radio" bind:group={useLikelihood} value={0} />noise-free
        observations</label
      >
      <label
        ><input type="radio" bind:group={useLikelihood} value={1} />observations
        with Gaussian noise, <Katex
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

  /* .gg-* classes from https://css.gg/trash, Copyright (c) 2020 css.gg, MIT license */
  .gg-trash {
    box-sizing: border-box;
    position: relative;
    display: block;
    transform: scale(var(--ggs, 1));
    width: 10px;
    height: 12px;
    border: 2px solid transparent;
    box-shadow: 0 0 0 2px, inset -2px 0 0, inset 2px 0 0;
    border-bottom-left-radius: 1px;
    border-bottom-right-radius: 1px;
    margin-top: 4px;
  }
  .gg-trash::after,
  .gg-trash::before {
    content: "";
    display: block;
    box-sizing: border-box;
    position: absolute;
  }
  .gg-trash::after {
    background: currentColor;
    border-radius: 3px;
    width: 16px;
    height: 2px;
    top: -4px;
    left: -5px;
  }
  .gg-trash::before {
    width: 10px;
    height: 4px;
    border: 2px solid;
    border-bottom: transparent;
    border-top-left-radius: 2px;
    border-top-right-radius: 2px;
    top: -7px;
    left: -2px;
  }
</style>
