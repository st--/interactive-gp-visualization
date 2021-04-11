<!-- Copyright (c) 2021 ST John

To dos:
- proper spacing/(re)sizing of Covariance/Line/Kernel plots
- Covariance plot: square aspect ratio so that covariance ellipse is correct
- axis & line labels (LaTeX/ketex?)
- adjust axis ticks when resizing
- Kernel plot: automatic y-axis scaling?
- marginal distribution plots for Covariance and Lineplot
- can we unify XIndicators/YIndicatorBar/YIndicatorCross in a single component?
- make pixel-scale of marginal distributions in Lineplot / Covariance equal to each other

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
  import { getIndicesAndFrac } from "./binarysearch.js";
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

  $: k1s = xs.map((x) => gp.kernel($x1, x));
  $: means = gp.mean(xs);
  $: covMat = gp.cov(xs);
  $: marginalVariances = covMat.diag();
  $: covSqrt = matrixSqrt(covMat);
  $: samples = sampleMvn(means, covSqrt, $vs);

  $: getDataAt = (dat) => {
    // TODO improve using d3-interpolate?
    const samples1 = samples.getRow(dat.idx1);
    const samples2 = samples.getRow(dat.idx2);
    const ys = samples1.map((y1, i) => dat.w1 * y1 + dat.w2 * samples2[i]);
    const mean = dat.w1 * means[dat.idx1] + dat.w2 * means[dat.idx2];
    const variance =
      dat.w1 * marginalVariances[dat.idx1] +
      dat.w2 * marginalVariances[dat.idx2];
    return { ys, mean, variance };
  };
  $: atX1 = getDataAt(getIndicesAndFrac(xs, $x1));
  $: atX2 = getDataAt(getIndicesAndFrac(xs, $x2));

  $: covY1Y2 = gp.cov([$x1, $x2]);
  $: covProps = covEllipse(covY1Y2);

  let points = [];
</script>

<div class="container">
  <div class="centered">
    <h2>Visualization</h2>
    <div>A Gaussian Process visualisation.</div>

    <div class="grid">
      <div class="chart kernel">
        <h3>Kernel</h3>
        <div class="widget">
          <Kernelplot {xs} ys={k1s} />
        </div>
        <div class="widget-description">
          Visualises a slice through the covariance function or kernel k(x1, .) as a
          function of the second argument.
          <br />
          <strong>Click:</strong> change x1 (<strong> + Shift:</strong> change x2).
          <strong>Move mouse:</strong> change x2 (<strong> + Shift:</strong> change x1).
        </div>
      </div>
      <div class="chart line">
        <h3>Line</h3>
        <div class="widget">
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
        <div class="widget-description">
          Visualises the Gaussian process f(x). Shaded areas and central line: +/- 1
          and 2 sigma confidence bands and mean. Colored lines: samples from the Gaussian
          process. Black circles: observations. Vertical lines at x1 (red) and x2 (orange).
          <br />
          <strong>Click on empty space:</strong> add a new observation.
          <strong>Click on black circle:</strong>
          remove observation.
          <strong>Shift+Click:</strong> change x1.
          <strong>Move mouse:</strong> change x2 (<strong> + Shift:</strong> change x1).
        </div>
      </div>
      <div class="chart covariance">
        <h3>Covariance</h3>
        <div class="widget">
          <Covariance {atX1} {atX2} {covProps} />
        </div>
        <div class="widget-description">
          Visualises the covariance between f(x1) and f(x2) (shaded areas) and the samples
          evaluated at those points (colored circles, corresponding to the colored lines
          in bottom-left plot).
        </div>
      </div>
      <div class="controls">
        <h3>Controls</h3>
        <div class="widget">
          <RandomSample xsLength={xs.length} />
          <button
            class="btn"
            on:click={(event) => {
              points = [];
            }}>Reset points</button>
        </div>
        <div class="widget-description">
          <em>Controls (below plots):</em>
          change number of samples; re-draw random samples; remove all points.
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .container {
    display: flex;
    justify-content: center;
  }
  .centered {
    margin: 20px;
    max-width: 1200px;
  }

  .grid {
    margin: 30px 0px;
    display: grid;
    justify-content: center;
    grid-template-rows: auto auto auto;
    grid-template-columns: 7fr 3fr;
    grid-gap: 30px;
    grid-template-areas:
      "kernel ."
      "line covariance"
      "controls .";
  }

  .chart.kernel {
    grid-area: kernel;
  }
  .chart.kernel .widget {
    height: 150px;
    background-color: #fafafa;
  }

  .chart.line {
    grid-area: line;
  }
  .chart.line .widget {
    height: 300px;
    background-color: #fafafa;
  }

  .chart.covariance {
    grid-area: covariance;
  }
  .chart.covariance .widget {
    height: 300px;
    background-color: #fafafa;
  }

  .controls {
    grid-area: controls;
  }

  .widget-description {
    margin-top: 10px;
  }

  @media (max-width: 800px) {
    .grid {
      grid-template-columns: auto;
      grid-template-areas:
        "kernel"
        "line"
        "covariance"
        "controls";
    }
  }
</style>
