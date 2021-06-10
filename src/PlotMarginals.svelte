<!-- Copyright (c) 2021 ST John -->
<script lang="ts">
  import { Matrix } from "ml-matrix";
  import Katex from "./Katex.svelte";
  import { onMount } from "svelte";
  import { scaleLinear, scaleOrdinal } from "d3-scale";
  import { schemeCategory10 } from "d3-scale-chromatic";
  import { x1, x2, y1, y2 } from "./store.js";
  import { getSVGpoint } from "./getsvgpoint.js";
  import { linspace, gaussian } from "./mymath.js";
  import { pathGenerator } from "./myplot.js";
  import Axes from "./Axes.svelte";
  import XIndicators from "./XIndicators.svelte";
  import YIndicatorBar from "./YIndicatorBar.svelte";
  import type { Point, DataAtX, PlotProps } from "./types";
  export let xs: number[],
    means: number[],
    marginalVariances: number[],
    samples: Matrix,
    points: Point[],
    atX1: DataAtX,
    atX2: DataAtX,
    plotProps: PlotProps;

  let svg: SVGSVGElement;
  let width = 500;
  let height = 200;

  const padding = { top: 25, right: 15, bottom: 45, left: 50 };

  $: xTicks = [0, 1, 2, 3, 4, 5, 6];

  $: yTicks = height > 180 ? [-4, -3, -2, -1, 0, 1, 2, 3, 4] : [-4, 0, 4];

  $: xScale = scaleLinear()
    .domain([minX, maxX])
    .range([padding.left, width - padding.right]);

  $: yScale = scaleLinear()
    .domain([minY, maxY])
    .range([height - padding.bottom, padding.top]);

  $: minX = 0; // xs[0];
  $: maxX = 6; // xs[xs.length - 1];
  $: minY = Math.min.apply(null, yTicks);
  $: maxY = Math.max.apply(null, yTicks);

  $: makePath = pathGenerator(xScale, yScale);

  // mean and samples
  $: pathMean = makePath(xs, means);
  $: samplePaths = samples
    ? samples
        .transpose()
        .to2DArray()
        .map((ys) => makePath(xs, ys))
    : [];

  // marginal y distributions at x1 and x2
  // TODO unify with Covariance?
  const num_grid = 100;
  function makeYs(dat: DataAtX) {
    return linspace(
      dat.mean - 4 * Math.sqrt(dat.variance),
      dat.mean + 4 * Math.sqrt(dat.variance),
      num_grid
    );
  }
  $: ys1 = makeYs(atX1);
  $: ys2 = makeYs(atX2);

  const mMax = 1;
  const mWidth = 50;
  $: mScale = scaleLinear().domain([0, mMax]).range([0, mWidth]);

  $: marginalDistX1 = gaussian(atX1.mean, atX1.variance);
  $: marginalDistX2 = gaussian(atX2.mean, atX2.variance);
  $: pathMarginal1 = pathGenerator(
    mScale,
    yScale,
    xScale($x1),
    0
  )(ys1.map(marginalDistX1), ys1);
  $: pathMarginal2 = pathGenerator(
    mScale,
    yScale,
    xScale($x2),
    0
  )(ys2.map(marginalDistX2), ys2);

  // one and two sigma confidence intervals
  $: sigma = marginalVariances.map((v) => Math.sqrt(v));
  $: confidenceLower2 = means.map((mean, idx: number) => mean - 2 * sigma[idx]);
  $: confidenceLower1 = means.map((mean, idx: number) => mean - sigma[idx]);
  $: confidenceUpper1 = means.map((mean, idx: number) => mean + sigma[idx]);
  $: confidenceUpper2 = means.map((mean, idx: number) => mean + 2 * sigma[idx]);
  $: makeArea = (lower: number[], upper: number[]) =>
    `${makePath(xs, lower)}L${makePath(xs, upper, true).slice(1)}Z`;
  $: areaConfidence1 = makeArea(confidenceLower1, confidenceUpper1);
  $: areaConfidence2 = makeArea(confidenceLower2, confidenceUpper2);

  // event handlers
  onMount(resize);
  function resize() {
    ({ width, height } = svg.getBoundingClientRect());
  }

  function addPoint(newX: number, newY: number) {
    points = points.concat({ x: newX, y: newY });
  }
  function removePointClick(point: Point, event: MouseEvent) {
    event.stopPropagation();
    points = points.filter((element) => element != point);
  }

  function handleClick(event: MouseEvent) {
    const pt = getSVGpoint(svg, event);
    const newX = xScale.invert(pt.x);
    const newY = yScale.invert(pt.y);
    if (event.shiftKey) {
      x1.set(newX);
    } else {
      addPoint(newX, newY);
    }
  }
  function handleMousemove(event: MouseEvent) {
    const pt = getSVGpoint(svg, event);
    const newX = xScale.invert(pt.x);
    const newY = yScale.invert(pt.y);
    if (event.shiftKey) {
      x1.set(newX);
    } else {
      x2.set(newX);
    }
    y1.set(newY);
    y2.set(newY);
  }

  // TODO unify with Covariance.svelte?
  const sampleColor = scaleOrdinal(schemeCategory10);
</script>

<svelte:window on:resize={resize} />

<div id="container">
  <div
    class="label"
    style="bottom: 2px; left: {xScale((minX + maxX) / 2) - 5}px;"
  >
    <Katex math="x" />
  </div>
  <div
    class="label"
    style="bottom: {yScale((minY + maxY) / 2) + 10}px; left: {xScale(0) -
      50}px; transform: rotate(-90deg);"
  >
    <Katex math="f(\cdot)" />
  </div>

  <svg
    bind:this={svg}
    on:mousemove={handleMousemove}
    on:click={handleClick}
    overflow="visible"
  >
    <Axes {xScale} {yScale} {xTicks} {yTicks} {width} {height} {padding} />
    <XIndicators {xScale} {yScale} y1={minY} y2={maxY} />
    <YIndicatorBar {xScale} {yScale} />

    <!-- data -->
    {#if plotProps.confidence}
      <path class="path-area" d={areaConfidence2} />
      <path class="path-area" d={areaConfidence1} />
    {/if}
    {#if plotProps.mean}
      <path class="path-line" d={pathMean} style="stroke-dasharray: 5;" />
    {/if}
    {#if plotProps.marginals}
      <path
        class="path-line"
        d={pathMarginal1}
        style="stroke: red; stroke-width: 2;"
      />
      <path
        class="path-line"
        d={pathMarginal2}
        style="stroke: orange; stroke-width: 2;"
      />
    {/if}

    {#if plotProps.samples}
      {#each samplePaths as path, i}
        <path
          class="path-line"
          d={path}
          style="stroke: {sampleColor(String(i))};"
        />
      {/each}

      {#each atX1.ys as y1, i}
        <circle
          cx={xScale($x1)}
          cy={yScale(y1)}
          r="3"
          style="fill: {sampleColor(String(i))};"
        />
      {/each}
      {#each atX2.ys as y2, i}
        <circle
          cx={xScale($x2)}
          cy={yScale(y2)}
          r="3"
          style="fill: {sampleColor(String(i))};"
        />
      {/each}
    {/if}

    {#each points as point}
      <circle
        class="observation"
        cx={xScale(point.x)}
        cy={yScale(point.y)}
        r="6"
        on:click={(event) => removePointClick(point, event)}
      />
      <!-- see https://svelte.dev/examples#7guis-circles -->
    {/each}
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
  }

  svg {
    width: 100%;
    height: 100%;
  }

  .observation {
    fill: black;
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
