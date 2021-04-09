<script>
  import { onMount } from "svelte";
  import { scaleLinear } from "d3-scale";
  import { zip } from "d3-array";
  import { x1, x2 } from "./store.js";
  import { getSVGpoint } from "./getsvgpoint.js";
  import Axes from "./Axes.svelte";
  import XIndicators from "./XIndicators.svelte";
  export let xs, ys;

  let svg;
  let width = 500;
  let height = 200;

  const padding = { top: 20, right: 40, bottom: 40, left: 25 };

  $: xTicks = [0, 1, 2, 3, 4, 5, 6];

  // TODO add negative y-ticks when conditioning
  $: yTicks = height > 180 ? [0, 0.5, 1] : [0, 1];

  $: xScale = scaleLinear()
    .domain([minX, maxX])
    .range([padding.left, width - padding.right]);

  $: yScale = scaleLinear()
    .domain([minY, maxY])
    .range([height - padding.bottom, padding.top]);

  $: minX = xs[0];
  $: maxX = xs[xs.length - 1];
  $: minY = Math.min.apply(null, yTicks);
  $: maxY = Math.max.apply(null, yTicks);
  $: path = `M${zip(xs, ys)
    .map((p) => `${xScale(p[0])},${yScale(p[1])}`)
    .join("L")}`;

  onMount(resize);

  function resize() {
    ({ width, height } = svg.getBoundingClientRect());
  }
  function handleClick(event) {
    const newX = xScale.invert(getSVGpoint(svg, event).x);
    x1.set(newX);
  }
  function handleMousemove(event) {
    const newX = xScale.invert(getSVGpoint(svg, event).x);
    x2.set(newX);
  }
</script>

<svelte:window on:resize={resize} />

<svg bind:this={svg} on:mousemove={handleMousemove} on:click={handleClick}>
  <Axes {xScale} {yScale} {xTicks} {yTicks} {width} {height} {padding} />
  <XIndicators {xScale} {yScale} y1={yTicks[0]} y2={2} />

  <!-- data -->
  <path class="path-line" d={path} />
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
</style>
