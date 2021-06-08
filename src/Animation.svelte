<!-- Copyright (c) 2021 ST John -->
<script>
  import { vs, us } from "./store.js";
  import { sampleMvn, sampleMvnTrajectory, randn } from "./mymath.js";
  import { HMC } from "./hmc.js";
  import { interpolateCatmullRom } from "./catmullrom.js";
  export let means, covSqrt, samples;

  let doAnimate = true;
  const animTypes = { greatCircle: 0, samples: 1, hmc: 2 };
  let animationType = animTypes.samples;

  let frameIdx = 0;

  let numFrames = 30;
  let sampleFrames;
  $: if (animationType === animTypes.greatCircle) {
    sampleFrames = sampleMvnTrajectory(means, covSqrt, $vs, $us, numFrames);
  }

  let currentVs;

  $: samples =
    animationType === animTypes.greatCircle
      ? sampleFrames[frameIdx]
      : sampleMvn(means, covSqrt, currentVs);

  let interpolator = (w) => {
    return $vs;
  };
  let Vanchor, nextVs;
  let hmcEpsilon = 0.1,
    hmcL = 15;
  vs.subscribe((value) => {
    if (animationType !== animTypes.greatCircle) {
      frameIdx = 0;
      Vanchor = [];
      nextVs = $vs;
    }
  });
  function updateInterpolator() {
    Vanchor.shift();
    while (Vanchor.length < 4) {
      if (animationType === animTypes.hmc && nextVs) {
        nextVs = HMC(nextVs, hmcEpsilon, hmcL);
      } else {
        nextVs = randn($vs.rows, $vs.columns, Math.random());
      }
      Vanchor.push(nextVs.clone());
    }
    interpolator = interpolateCatmullRom(...Vanchor);
  }

  let numInterpolate = 8;
  function updateFrame() {
    if (doAnimate) {
      if (animationType === animTypes.greatCircle) {
        frameIdx = (frameIdx + 1) % numFrames;
      } else {
        if (frameIdx == 0) {
          updateInterpolator();
        }
        const w = frameIdx / numInterpolate;
        currentVs = interpolator(w);
        frameIdx = (frameIdx + 1) % numInterpolate;
      }
    }
  }

  let animationIntervalHandle;
  let animationDelay = 100;
  $: {
    clearInterval(animationIntervalHandle);
    animationIntervalHandle = setInterval(updateFrame, animationDelay);
  }
</script>

<div>
  Animation:
  <select bind:value={animationType}>
    <option value={animTypes.greatCircle}>great circles</option>
    <option value={animTypes.samples}>interpolated samples</option>
    <option value={animTypes.hmc}>interpolated HMC trajectory</option>
  </select>
  <button
    class="btn"
    on:click={(_event) => {
      doAnimate = !doAnimate;
    }}
    >{#if doAnimate}Pause{:else}Play{/if}</button
  >
  <!--
  {#if animationType === animTypes.hmc}
    <input type="number" bind:value={hmcEpsilon} />
    <input type="number" bind:value={hmcL} />
  {/if}
  -->
</div>
