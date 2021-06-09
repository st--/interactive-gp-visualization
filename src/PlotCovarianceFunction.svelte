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

  const padding = { top: 25, right: 15, left: 50 }; // to match PlotMarginals
  padding.bottom = padding.left + padding.right - padding.top; // to square up

  $: xTicks = size > 180 ? linspace(0, 6, 7) : linspace(0, 6, 3);
  $: yTicks = xTicks;

  // fix aspect ratio to be square:
  $: size = Math.min(width, height);

  $: xScale = scaleLinear()
    .domain([minX, maxX])
    .range([padding.left, size - padding.right]);

  $: yScale = scaleLinear()
    .domain([maxX, minX])
    .range([size - padding.bottom, padding.top]);

  $: minX = Math.min.apply(null, xTicks);
  $: maxX = Math.max.apply(null, xTicks);

  $: contourGenerator = contours().size([covMat.rows, covMat.columns]);
  $: flatCov = covMat.transpose().to1DArray();
  $: console.log(flatCov);
  let numContours = 30;
  $: contourGeo = linspace(-1, 1, numContours).map((threshold) =>
    contourGenerator.contour(flatCov, threshold)
  );

  // https://observablehq.com/@d3/contours
  const grid = flatCov;

  // Converts from grid coordinates (indexes) to screen coordinates (pixels).
  function mytransform({ type, value, coordinates }) {
    return {
      type,
      value,
      coordinates: coordinates.map((rings) => {
        return rings.map((points) => {
          return points.map(([x, y]) => [
            xScale((x / covMat.rows) * 6 + 0),
            yScale((y / covMat.rows) * 6 + 0),
          ]);
        });
      }),
    };
  }
  $: contourPaths = contourGeo.map(mytransform).map(geoPath());
  $: console.log(contourPaths);

  $: color = scaleSequential([numContours, 0], interpolateSpectral);
  onMount(resize);
  $: console.log("width", width, "height", height);

  function resize() {
    ({ width, height } = svg.getBoundingClientRect());
  }
  function handleMousemove(event) {
    const pt = getSVGpoint(svg, event);
    const newX = xScale.invert(pt.x);
    const newY = yScale.invert(pt.y);
    if (event.shiftKey) {
      x1.set(newX);
      x2.set(newY);
    } else {
      x1.set(newY);
      x2.set(newX);
    }
  }
</script>

<svelte:window on:resize={resize} />

<div>
  <svg bind:this={svg} on:mousemove={handleMousemove}>
    <Axes
      {xScale}
      {yScale}
      {xTicks}
      {yTicks}
      width={size}
      height={size}
      {padding}
    />
    {#each contourPaths as contourPath, i}
      <path d={contourPath} style="fill: {color(i)};" />
    {/each}
  </svg>
</div>

<style>
  div {
    width: 400px;
    height: 400px;
  }
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
