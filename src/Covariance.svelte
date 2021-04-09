<script>
  import { onMount } from "svelte";
  import { scaleLinear, scaleOrdinal } from "d3-scale";
  import { schemeCategory10 } from "d3-scale-chromatic";
  import { zip } from "d3-array";
  import Axes from "./Axes.svelte";
  export let atX1, atX2, covProps;

  let svg;
  let width = 300;
  let height = 300;

  const padding = { top: 25, right: 40, bottom: 40, left: 25 };

  const sigmaContours = [1, 2];

  $: yTicks = height > 180 ? [-3, -2, -1, 0, 1, 2, 3] : [-3, 0, 3];
  $: xTicks = yTicks;

  // TODO: fix aspect ratio to be square!
  $: xScale = scaleLinear()
    .domain([minY, maxY])
    .range([padding.left, width - padding.right]);

  $: yScale = scaleLinear()
    .domain([minY, maxY])
    .range([height - padding.bottom, padding.top]);

  $: scaleFactor = Math.abs((yScale(maxY) - yScale(minY)) / (maxY - minY)); // TODO: is this right?

  $: yPairs = zip(atX1.ys, atX2.ys);

  $: minY = Math.min.apply(null, yTicks);
  $: maxY = Math.max.apply(null, yTicks);

  onMount(resize);

  function resize() {
    ({ width, height } = svg.getBoundingClientRect());
  }

  // TODO unify with Lineplot.svelte?
  const sampleColor = scaleOrdinal(schemeCategory10);
</script>

<svelte:window on:resize={resize} />

<svg bind:this={svg}>
  <Axes {xScale} {yScale} {xTicks} {yTicks} {width} {height} {padding} />

  <!-- data -->
  <g
    transform="translate({scaleFactor * atX1.mean} {-scaleFactor * atX2.mean})"
  >
    <g transform="rotate({covProps.angle} {xScale(0)} {yScale(0)})">
      {#each sigmaContours as sigma}
        <ellipse
          class="path-area"
          cx={xScale(0)}
          cy={yScale(0)}
          rx={scaleFactor * sigma * covProps.width}
          ry={scaleFactor * sigma * covProps.length}
        />
      {/each}
    </g>
  </g>

  {#each yPairs as ys, i}
    <circle
      cx={xScale(ys[0])}
      cy={yScale(ys[1])}
      r="3"
      style="fill: {sampleColor(i)};"
    />
  {/each}
</svg>

<style>
  svg {
    width: 100%;
    height: 100%;
  }

  circle {
    fill: orange;
    fill-opacity: 0.6;
    stroke: rgba(0, 0, 0, 0.5);
  }

  .path-line {
    fill: none;
    stroke: rgb(0, 100, 100);
    stroke-linejoin: round;
    stroke-linecap: round;
    stroke-width: 2;
  }

  .path-area {
    fill: rgba(0, 100, 100, 0.2);
  }
</style>
