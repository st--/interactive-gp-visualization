<!-- Copyright (c) 2021 ST John -->
<script>
  import { vs, us } from "./store.js";
  import { sampleMvn, sampleMvnTrajectory, randn } from "./mymath.js";
  import { HMC } from "./hmc.js";
  import { interpolateCatmullRom } from "./catmullrom.js";
  export let means, covSqrt, samples;

  let doAnimate = true;
  const AnimationTypes = Object.freeze({ greatCircle: 0, samples: 1, hmc: 2 });
  let animationType = AnimationTypes.samples;

  let frameIdx = 0;

  let numFrames = 30;
  let sampleFrames;
  $: if (animationType === AnimationTypes.greatCircle) {
    sampleFrames = sampleMvnTrajectory(means, covSqrt, $vs, $us, numFrames);
  }

  let currentVs;

  $: samples =
    animationType === AnimationTypes.greatCircle
      ? sampleFrames[frameIdx]
      : sampleMvn(means, covSqrt, currentVs);

  let interpolator = (w) => {
    return $vs;
  };
  let Vanchor, nextVs;
  vs.subscribe((value) => {
    if (animationType !== AnimationTypes.greatCircle) {
      frameIdx = 0;
      Vanchor = [];
      nextVs = $vs;
    }
  });

  let hmcEpsilon = 0.1,
    hmcL = 15;
  function updateInterpolator() {
    Vanchor.shift();
    while (Vanchor.length < 4) {
      if (animationType === AnimationTypes.hmc && nextVs) {
        nextVs = HMC(nextVs, hmcEpsilon, hmcL);
      } else {
        nextVs = randn($vs.rows, $vs.columns, Math.random());
      }
      Vanchor.push(nextVs.clone()); // as nextVs keeps getting changed in place
    }
    interpolator = interpolateCatmullRom(...Vanchor);
  }

  let numInterpolate = 8;
  function updateFrame() {
    if (doAnimate || (frameIdx == 0)) {
      if (animationType === AnimationTypes.greatCircle) {
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
    <option value={AnimationTypes.greatCircle}>great circles</option>
    <option value={AnimationTypes.samples}>interpolated random samples</option>
    <option value={AnimationTypes.hmc}>interpolated HMC trajectory</option>
  </select>
  <button
    class="btn"
    on:click={(_event) => {
      doAnimate = !doAnimate;
    }}
    >{#if doAnimate}Pause{:else}Play{/if}</button
  >
  <!--
  {#if animationType === AnimationTypes.hmc}
    <input type="number" bind:value={hmcEpsilon} />
    <input type="number" bind:value={hmcL} />
  {/if}
  -->
</div>
