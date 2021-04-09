<!--
To dos:
- proper spacing/(re)sizing of Covariance/Line/Kernel plots
- Covariance plot: square aspect ratio so that covariance ellipse is correct
- axis & line labels (LaTeX/ketex?)
- adjust axis ticks when resizing
- Kernel plot: automatic y-axis scaling?
- marginal distribution plots for Covariance and Lineplot

More features:
- checkbox for showing/hiding mean/credible intervals
- select prior mean function (linear, quadratic, sine?)
- select prior kernel function (sqexp, mat32, mat12, periodic?)
- adjustable likelihood noise scale (input slider?)
- smoothly animated samples (see http://mlss.tuebingen.mpg.de/2013/Hennig_2013_Animating_Samples_from_Gaussian_Distributions.pdf)
- include log marginal likelihood
- include 2D visualisation of covariance function (contour plot)
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
  $: getDataAt = (idx) => {
    return { ys: samples.getRow(idx), mean: means[idx] };
  };
  $: atX1 = getDataAt(getIndexInSorted(xs, $x1));
  $: atX2 = getDataAt(getIndexInSorted(xs, $x2));

  $: covY1Y2 = gp.cov([$x1, $x2]);
  $: covProps = covEllipse(covY1Y2);

  let points = [];
</script>

<div>
  <h2>Visualization</h2>

  <div class="text-container">
    <div class="text-explanation" style="grid-area: line;">
      <em>Bottom left:</em>
      Visualises the Gaussian process f(x). Shaded areas and central line: +/- 1
      and 2 sigma confidence bands and mean. Colored lines: samples from the Gaussian
      process. Black circles: observations. Vertical lines at x1 (red) and x2 (orange).
      <br />
      <strong>Click on empty space:</strong> add a new observation.
      <strong>Click on black circle:</strong>
      remove observation.
      <strong>Shift+Click:</strong> change x1.
      <strong>Move mouse:</strong> change x2.
    </div>
    <div class="text-explanation" style="grid-area: kernel;">
      <em>Top left:</em>
      Visualises a slice through the covariance function or kernel k(x1, .) as a
      function of the second argument.
      <br />
      <strong>Click:</strong> change x1.
      <strong>Move mouse:</strong> change x2.
    </div>
    <div class="text-explanation" style="grid-area: covariance;">
      <em>Right:</em>
      Visualises the covariance between f(x1) and f(x2) (shaded areas) and the samples
      evaluated at those points (colored circles, corresponding to the colored lines
      in bottom-left plot).
    </div>
    <div class="text-explanation" style="grid-area: controls;">
      <em>Controls (below plots):</em>
      change number of samples; re-draw random samples; remove all points.
    </div>
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
        {atX1}
        {atX2}
      />
    </div>
    <div class="squarechart" style="grid-area: covariance;">
      <Covariance {atX1} {atX2} {covProps} />
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
  .text-container {
    max-width: 1200px;
    display: grid;
    grid-template-columns: 60% auto;
    grid-template-areas:
      "kernel covariance"
      "line controls";
  }
  .text-explanation {
    margin: 10px;
  }
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
