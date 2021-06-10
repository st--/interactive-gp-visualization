<!-- Copyright (c) 2021 ST John -->
<script lang="ts">
  import Katex from "./Katex.svelte";
  import { onMount } from "svelte";
  import { scaleLinear } from "d3-scale";
  import { x1, x2 } from "./store.js";
  import { getSVGpoint } from "./getsvgpoint.js";
  import { pathGenerator } from "./myplot.js";
  import Axes from "./Axes.svelte";
  import XIndicators from "./XIndicators.svelte";
  import type { DataAtX } from "./types";
  export let xs: number[],
    k1s: number[],
    k2s: number[],
    atX1: DataAtX,
    atX2: DataAtX;

  let svg: SVGSVGElement;
  let width = 500;
  let height = 200;

  const padding = { top: 25, right: 15, bottom: 40, left: 50 };

  $: xTicks = [0, 1, 2, 3, 4, 5, 6];

  // TODO add negative y-ticks when conditioning
  $: yTicks = height > 180 ? [-1, -0.5, 0, 0.5, 1] : [-1, 0, 1];

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
  $: makePath = pathGenerator(xScale, yScale);
  $: path1 = makePath(xs, k1s);
  $: path2 = makePath(xs, k2s);

  onMount(resize);

  function resize() {
    ({ width, height } = svg.getBoundingClientRect());
  }
  function handleClick(event: MouseEvent) {
    const newX = xScale.invert(getSVGpoint(svg, event).x);
    if (event.shiftKey) {
      x2.set(newX);
    } else {
      x1.set(newX);
    }
  }
  function handleMousemove(event: MouseEvent) {
    const newX = xScale.invert(getSVGpoint(svg, event).x);
    if (event.shiftKey) {
      x1.set(newX);
    } else {
      x2.set(newX);
    }
  }
  function handleTouchmove(event: TouchEvent) {
    event.preventDefault();
    const touches = event.touches;
    const newX = xScale.invert(getSVGpoint(svg, touches[0]).x);
    if (touches.length == 1) {
      x1.set(newX);
    } else {
      x2.set(newX);
    }
  }
</script>

<svelte:window on:resize={resize} />

<div id="container">
  <div class="label" style="bottom: 2px; left: {xScale($x1) - 5}px;">
    <Katex math="x_1" />
  </div>
  <div class="label" style="bottom: 2px; left: {xScale($x2) - 5}px;">
    <Katex math="x_2" />
  </div>
  <div
    class="label"
    style="bottom: {yScale((minY + maxY) / 2)}px; left: {xScale(0) -
      60}px; transform: rotate(-90deg);"
  >
    <Katex math="k(x_i, \cdot)" />
  </div>

  <svg
    bind:this={svg}
    on:click={handleClick}
    on:mousemove={handleMousemove}
    on:touchmove={handleTouchmove}
    overflow="visible"
  >
    <Axes {xScale} {yScale} {xTicks} {yTicks} {width} {height} {padding} />
    <line
      x1={xScale(xTicks[0])}
      x2={xScale(xTicks[xTicks.length - 1])}
      y1={yScale(0)}
      y2={yScale(0)}
      style="stroke: #ddd;"
    />
    <XIndicators
      {xScale}
      {yScale}
      y1={yTicks[0]}
      y2={yTicks[yTicks.length - 1]}
    />

    <!-- data -->
    <path class="path-line" style="stroke: red;" d={path1} />
    <path class="path-line" style="stroke: orange;" d={path2} />
    <circle style="fill: red;" cx={xScale($x1)} cy={yScale(atX1.k1)} r="3" />
    <circle
      style="fill: orange; stroke: red;"
      cx={xScale($x1)}
      cy={yScale(atX1.k2)}
      r="3"
    />
    <circle
      style="fill: red; stroke: orange;"
      cx={xScale($x2)}
      cy={yScale(atX2.k1)}
      r="3"
    />
    <circle style="fill: orange;" cx={xScale($x2)} cy={yScale(atX2.k2)} r="3" />
  </svg>
</div>

<style>
  #container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .label {
    position: absolute;
    z-index: 1;
  }

  svg {
    width: 100%;
    height: 100%;
  }

  .path-line {
    fill: none;
    stroke: rgb(0, 100, 100);
    stroke-linejoin: round;
    stroke-linecap: round;
    stroke-width: 1;
  }

  circle {
    stroke-width: 2;
  }
</style>
