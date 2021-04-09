<!--
To dos:
- proper spacing/(re)sizing of Covariance/Line/Kernel plots
- axis & line labels (LaTeX/ketex?)
- Covariance plot: square aspect ratio
- Covariance plot: fix covariance ellipse
- Kernel plot: automatic y-axis scaling?
- marginal distribution plots for Covariance and Lineplot

More features:
- checkbox for showing/hiding mean/credible intervals
- select prior mean function (linear, quadratic, sine?)
- select prior kernel function (sqexp, mat32, mat12, periodic?)
- adjustable likelihood noise scale (input slider?)
- smoothly animated samples (see http://mlss.tuebingen.mpg.de/2013/Hennig_2013_Animating_Samples_from_Gaussian_Distributions.pdf)
- include log marginal likelihood
- include 2D visualisation of covariance function
- better support for mobile / touch

Future thoughts:
- per-data point noise scale - how to do UI?
  entered by click-and-pull when creating data points on main plot
- optimize hyperparameters
-->
<script lang="ts">
  import Lineplot from "./Lineplot.svelte";
  import Kernelplot from "./Kernelplot.svelte";
  import Covariance from "./Covariance.svelte";
  import RandomSample from "./RandomSample.svelte";
  import { x1, x2, vs } from "./store.js";
  import { sqexp, matern12, white, sumKernel } from "./kernels.js";
  import { linspace, matrixSqrt, sampleMvn, covEllipse } from "./mymath.js";
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
  $: covMat = gp.cov(xs);
  $: marginalVariances = covMat.diag();
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
  <h2>Visualization</h2>

  <div>
    <h3>Instructions</h3>
    Top-left: visualises slice through covariance function k(x1, .) where x1 can
    be changed by clicking (red line). Right: visualises covariance k(x1, x2) where
    x1 can be changed by clicking in top-left plot and x2 follows mouse in top-left
    and bottom-left plots (orange line). Dots correspond to function values at the
    samples in the bottom-left plot. Bottom-left: visualises mean (solid blue line),
    marginal variance (shaded blue area), and samples from the GP. Clicking adds
    data points (black circles); clicking on an existing point removes it. Controls:
    change number of samples; re-draw random samples; remove all points.
  </div>

  <div class="plot-container">
    <div class="chart" style="grid-area: kernel;">
      <Kernelplot {xs} ys={k1s} />
    </div>
    <div class="chart" style="grid-area: line;">
      <Lineplot
        {xs}
        {means}
        {marginalVariances}
        {samples}
        bind:points
        {ysAtX1}
        {ysAtX2}
      />
    </div>
    <div class="squarechart" style="grid-area: covariance;">
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
  .plot-container {
    display: grid;
    grid-template-rows: 30% 70%;
    grid-template-columns: 70% 30%;
    grid-template-areas:
      "kernel ."
      "line covariance";
  }
  .chart {
    margin: 20px 20px;
    background-color: #fafafa;
  }
  .squarechart {
    min-width: 200px;
    min-height: 200px;
    margin: 20px 20px;
    background-color: #fafafa;
  }
</style>
