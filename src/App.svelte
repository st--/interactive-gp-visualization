<!--
To dos:

v0: prior
- GP samples
- covariance plot

v1: posterior
- fixed data
- GP conditional

v2: custom data
- click on main plot adds/shift+click removes data point

v3: advanced interactions
- select kernel functions
- input slider for noise scale

vX: future thoughts
- per-data point noise scale, entered by click-and-pull when creating data points on main plot
-->
<script lang="ts">
  import Lineplot from "./Lineplot.svelte";
  import Kernelplot from "./Kernelplot.svelte";
  import Covariance from "./Covariance.svelte";
  import RandomSample from "./RandomSample.svelte";
  import { x1, x2, vs } from "./store.js";
  import { sqexp, matern12, white, sumKernel, covMatrix } from "./kernels.js";
  import {
    linspace,
    matrixSqrt,
    randn,
    sampleMvn,
    covEllipse,
  } from "./mymath.js";
  import { getIndexInSorted } from "./binarysearch.js";
  import { posterior, prior } from "./gpposterior.js";

  let num_grid = 40;
  $: xs = linspace(0, 6, num_grid);

  const k = sqexp();
  $: kernelWithJitter = sumKernel([k, white(1e-6)]);

  $: gp =
    points.length > 0
      ? posterior(
          kernelWithJitter,
          points.map((p) => p.x),
          points.map((p) => p.y)
        )
      : prior(kernelWithJitter);

  let numSamples = 3;

  $: k1s = xs.map((x) => gp.kernel($x1, x));
  $: means = gp.mean(xs);
  $: confidence = xs.map((x) => 2 * Math.sqrt(gp.kernel(x, x))); // +/- 2 standard deviations
  $: covMat = gp.cov(xs);
  // TODO: confidence from covMat.diagonal
  $: covSqrt = matrixSqrt(covMat);
  $: samples = sampleMvn(means, covSqrt, $vs);

  // TODO: linear interpolation between two points
  $: ysAtX1 = samples.getRow(getIndexInSorted(xs, $x1));
  $: ysAtX2 = samples.getRow(getIndexInSorted(xs, $x2));

  // TODO: either subtract mean or shift axes in Covariance plot accordingly
  $: covY1Y2 = gp.cov([$x1, $x2]);
  $: covProps = covEllipse(covY1Y2);

  let points = [];
</script>

<div>
  The mouse position is {$x2}. Last clicked on {$x1}.

  <h2>Visualization</h2>

  <div style="display: grid;">
    <div class="chart" style="grid-row: 1; grid-column: 1;">
      <Kernelplot {xs} ys={k1s} />
    </div>
    <div class="chart" style="grid-row: 2; grid-column: 1;">
      <Lineplot
        {xs}
        {means}
        {confidence}
        {samples}
        bind:points
        {ysAtX1}
        {ysAtX2}
      />
    </div>
    <div class="chart" style="grid-row: 2; grid-column: 2;">
      <Covariance {ysAtX1} {ysAtX2} {covProps} />
    </div>
  </div>
  <RandomSample xsLength={num_grid} {numSamples} />
  <button
    class="btn"
    on:click={(event) => {
      points = [];
    }}>Reset points</button
  >
</div>

<style>
  .chart {
    width: 100%;
    max-width: 640px;
    height: calc(100% - 4em);
    min-height: 280px;
    max-height: 480px;
    margin: 0 auto;
  }
</style>
