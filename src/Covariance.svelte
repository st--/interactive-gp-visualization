<!-- Copyright (c) 2021 ST John -->
<script>
  import { onMount } from "svelte";
  import { scaleLinear, scaleOrdinal } from "d3-scale";
  import { schemeCategory10 } from "d3-scale-chromatic";
  import { zip } from "d3-array";
  import { y1, y2 } from "./store.js";
  import { getSVGpoint } from "./getsvgpoint.js";
  import { linspace, gaussian } from "./mymath.js";
  import { pathGenerator } from "./myplot.js";
  import Axes from "./Axes.svelte";
  import YIndicatorCross from "./YIndicatorCross.svelte";
  export let atX1, atX2, covProps, plotProps;

  let svg;
  let width = 300;
  let height = 300;

  const padding = { top: 25, right: 40, bottom: 40, left: 25 };

  const sigmaContours = [1, 2];

  $: yTicks = size > 180 ? [-3, -2, -1, 0, 1, 2, 3] : [-3, 0, 3];
  $: xTicks = yTicks;

  // fix aspect ratio to be square:
  $: size = Math.min(width, height);

  $: xScale = scaleLinear()
    .domain([minY, maxY])
    .range([padding.left, size - padding.right]);

  $: yScale = scaleLinear()
    .domain([minY, maxY])
    .range([size - padding.bottom, padding.top]);

  $: scaleFactor = Math.abs((yScale(maxY) - yScale(minY)) / (maxY - minY)); // TODO: is this right?

  $: yPairs = zip(atX1.ys, atX2.ys);

  $: minY = Math.min.apply(null, yTicks);
  $: maxY = Math.max.apply(null, yTicks);

  // marginal y distributions at x1 and x2
  // TODO unify with Lineplot?
  const num_grid = 60;
  $: ys = linspace(minY, maxY, num_grid);
  const mMax = 1;
  const mWidth = 50;
  $: mScale = scaleLinear().domain([0, mMax]).range([0, mWidth]);

  $: marginalDistX1 = gaussian(atX1.mean, atX1.variance);
  $: marginalDistX2 = gaussian(atX2.mean, atX2.variance);
  $: pathMarginal1 = pathGenerator(
    xScale,
    mScale,
    0,
    yScale(maxY)
  )(
    ys,
    ys.map(marginalDistX1).map((p) => -p) // negate to avoid two separate mScales
  );
  $: pathMarginal2 = pathGenerator(
    mScale,
    yScale,
    xScale(maxY),
    0
  )(ys.map(marginalDistX2), ys);

  onMount(resize);

  function resize() {
    ({ width, height } = svg.getBoundingClientRect());
  }
  function handleMousemove(event) {
    const pt = getSVGpoint(svg, event);
    const newX = xScale.invert(pt.x);
    const newY = yScale.invert(pt.y);
    y1.set(newX);
    y2.set(newY);
  }

  // TODO unify with Lineplot.svelte?
  const sampleColor = scaleOrdinal(schemeCategory10);
</script>

<svelte:window on:resize={resize} />

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
  <YIndicatorCross {xScale} {yScale} {minY} {maxY} />

  <!-- data -->
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

  {#if plotProps.confidence}
    <g
      transform="translate({scaleFactor * atX1.mean} {-scaleFactor *
        atX2.mean})"
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
  {/if}
  {#if plotProps.mean}
    <circle
      cx={xScale(atX1.mean)}
      cy={yScale(atX2.mean)}
      r="1"
      style="fill: rgba(0, 100, 100);"
    />
  {/if}

  {#if plotProps.samples}
    {#each yPairs as ys, i}
      <circle
        cx={xScale(ys[0])}
        cy={yScale(ys[1])}
        r="3"
        style="fill: {sampleColor(i)};"
      />
    {/each}
  {/if}
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
