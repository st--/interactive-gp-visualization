<!-- Copyright (c) 2021 ST John -->
<script>
  import { onMount } from "svelte";
  import { scaleLinear, scaleSequential } from "d3-scale";
  import { interpolateBlues as colorScale } from "d3-scale-chromatic";
  import { contours } from "d3-contour";
  import { geoPath, geoIdentity } from "d3-geo";
  import { x1, x2 } from "./store.js";
  import { linspace } from "./mymath.js";
  import { getSVGpoint } from "./getsvgpoint.js";
  import Axes from "./Axes.svelte";
  import XIndicatorCross from "./XIndicatorCross.svelte";
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
  let numContours = 15;
  $: contourGeo = linspace(-1, 1, numContours).map((threshold) =>
    contourGenerator.contour(flatCov, threshold)
  );

  // https://observablehq.com/@d3/contours
  // Converts from grid coordinates (indexes) to screen coordinates (pixels).
  function createTransform(xScale, yScale) {
    return ({ type, value, coordinates }) => {
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
    };
  }
  $: mytransform = createTransform(xScale, yScale);
  $: contourPaths = contourGeo.map(mytransform).map(geoPath());

  $: color = scaleSequential([0, contourPaths.length - 1], colorScale);
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

<div id="container">
  <svg bind:this={svg} on:mousemove={handleMousemove}>
    {#each contourPaths as contourPath, i}
      <path d={contourPath} style="fill: {color(i)};" />
    {/each}

    <Axes
      {xScale}
      {yScale}
      {xTicks}
      {yTicks}
      width={size}
      height={size}
      {padding}
    />

    <XIndicatorCross
      {xScale}
      {yScale}
      x={$x1}
      style="stroke: red; stroke-width: 2"
    />
    <XIndicatorCross
      {xScale}
      {yScale}
      x={$x2}
      style="stroke: orange; stroke-width: 2"
    />
  </svg>
</div>

<style>
  #container {
    position: relative;
    width: 100%;
    height: 100%;
  }
  svg {
    width: 100%;
    height: 100%;
  }
</style>
