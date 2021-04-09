<!-- Copyright (c) 2021 ST John -->
<script>
  import { onMount } from "svelte";
  import { scaleLinear, scaleSequential } from "d3-scale";
  import { interpolateSpectral } from "d3-scale-chromatic";
  import { contours } from "d3-contour";
  import { geoPath, geoIdentity } from "d3-geo";
  import { x1, x2 } from "./store.js";
  import { linspace } from "./mymath.js";
  import { getSVGpoint } from "./getsvgpoint.js";
  import Axes from "./Axes.svelte";
  export let covMat;

  let svg;
  let width = 300;
  let height = 300;

  const padding = { top: 25, right: 40, bottom: 40, left: 25 };

  $: xTicks = height > 180 ? linspace(0, 40, 5) : linspace(0, 40, 3);
  $: yTicks = xTicks;

  // TODO: fix aspect ratio to be square!
  $: xScale = scaleLinear()
    .domain([minX, maxX])
    .range([padding.left, width - padding.right]);

  $: yScale = scaleLinear()
    .domain([minX, maxX])
    .range([height - padding.bottom, padding.top]);

  $: minX = Math.min.apply(null, xTicks);
  $: maxX = Math.max.apply(null, xTicks);

  $: contourGenerator = contours().size([covMat.rows, covMat.columns]);
  $: flatCov = covMat.transpose().to1DArray();
  $: console.log(flatCov);
  $: contourGeo = linspace(-1, 1, 10).map((threshold) =>
    contourGenerator.contour(flatCov, threshold)
  );
  $: contourPaths = contourGeo.map(geoPath(geoIdentity().scale(5)));
  $: console.log(contourPaths);

  $: color = scaleSequential([10, 0], interpolateSpectral);
  onMount(resize);

  function resize() {
    ({ width, height } = svg.getBoundingClientRect());
  }
  function handleMousemove(event) {
    const pt = getSVGpoint(svg, event);
    const newX = xScale.invert(pt.x);
    const newY = yScale.invert(pt.y);
    x1.set(newX);
    x2.set(newY);
  }
</script>

<svelte:window on:resize={resize} />

<svg bind:this={svg} on:mousemove={handleMousemove}>
  <Axes {xScale} {yScale} {xTicks} {yTicks} {width} {height} {padding} />
  {#each contourPaths as contourPath, i}
    <path d={contourPath} style="fill: {color(i)};" />
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
