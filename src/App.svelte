<!-- Copyright (c) 2021 ST John

To dos:
- proper spacing/(re)sizing of Covariance/Line/Kernel plots
- vertically align range sliders with rest of line
- fix relative size when window too small...
- center/right-align labels instead of manual pixel shifts
- adjust axis ticks when resizing
- Kernel plot: automatic y-axis scaling?
- can we unify XIndicators/YIndicatorBar/YIndicatorCross in a single component?
- convert 1 and 2 sigma to 50/95% confidence ?

More features:
- add two observations when clicking in Covariance plot?
- select prior mean function (linear, quadratic, sine?)
- include log marginal likelihood
- include 2D visualisation of covariance function (contour plot)
- better support for mobile / touch

Future thoughts:
- per-data point noise scale - how to do UI?
  entered by click-and-pull when creating data points on main plot
- optimize hyperparameters
-->
<script lang="ts">
  import CollapsibleCard from "./CollapsibleCard.svelte";
  import Katex from "./Katex.svelte";
  import Lineplot from "./Lineplot.svelte";
  import Kernelplot from "./Kernelplot.svelte";
  import CovMat from "./CovMat.svelte";
  import Covariance from "./Covariance.svelte";
  import RandomSample from "./RandomSample.svelte";
  import ConfigPlot from "./ConfigPlot.svelte";
  import ConfigData from "./ConfigData.svelte";
  import { x1, x2, vs, us } from "./store.js";
  import {
    sqexp,
    makeSqexp,
    makeMatern12,
    makeMatern32,
    makeMatern52,
    makePeriodic,
    makeLinear,
    white,
    sumKernel,
  } from "./kernels.js";
  import {
    linspace,
    matrixSqrt,
    sampleMvn,
    sampleMvnTrajectory,
    covEllipse,
  } from "./mymath.js";
  import { getIndicesAndFrac } from "./binarysearch.js";
  import { posterior, prior } from "./gpposterior.js";

  let kernelChoices = [
    makeMatern12(), // 0
    makeMatern32(), // 1
    makeMatern52(), // 2
    makeSqexp(), // 3
    makePeriodic(), // 4
    makeLinear(), // 5
  ];
  let selectedKernel = kernelChoices[3];
  let noiseScale = 0.0;

  let doAnimate = true;

  let plotProps = {
    mean: true,
    confidence: true,
    samples: true,
    marginals: true,
  };

  let num_grid = 150;
  $: xs = linspace(0, 6, num_grid);

  $: kernelWithJitter = sumKernel([
    selectedKernel
      ? selectedKernel.kernel(...selectedKernel.parameters.map((p) => p.value))
      : sqexp(),
    white(1e-6),
  ]);

  $: gp =
    points.length > 0
      ? posterior(
          kernelWithJitter,
          points.map((p) => p.x),
          points.map((p) => p.y),
          noiseScale * noiseScale
        )
      : prior(kernelWithJitter);

  $: k1s = xs.map((x) => gp.kernel($x1, x));
  $: k2s = xs.map((x) => gp.kernel($x2, x));
  $: means = gp.mean(xs);
  $: covMat = gp.cov(xs);
  $: marginalVariances = covMat.diag();
  $: covSqrt = matrixSqrt(covMat);

  //$: samples = sampleMvn(means, covSqrt, $vs);
  let frameIdx = 0;
  let numFrames = 30;
  $: sampleFrames = sampleMvnTrajectory(means, covSqrt, $vs, $us, numFrames);
  $: samples = sampleFrames[frameIdx];

  function updateFrameIdx() {
    if (doAnimate) {
      frameIdx = (frameIdx + 1) % numFrames;
    }
  }

  let animationInterval;
  let animationDelay = 100;
  $: {
    clearInterval(animationInterval);
    setInterval(updateFrameIdx, animationDelay);
  }

  $: getDataAt = (dat) => {
    // TODO improve using d3-interpolate?
    const samples1 = samples.getRow(dat.idx1);
    const samples2 = samples.getRow(dat.idx2);
    const ys = samples1.map(
      (y1: number, i: number) => dat.w1 * y1 + dat.w2 * samples2[i]
    );
    const mean = dat.w1 * means[dat.idx1] + dat.w2 * means[dat.idx2];
    const variance =
      dat.w1 * marginalVariances[dat.idx1] +
      dat.w2 * marginalVariances[dat.idx2];
    const k1 = dat.w1 * k1s[dat.idx1] + dat.w2 * k1s[dat.idx2];
    const k2 = dat.w1 * k2s[dat.idx1] + dat.w2 * k2s[dat.idx2];
    return { ys, mean, variance, k1, k2 };
  };
  $: atX1 = getDataAt(getIndicesAndFrac(xs, $x1));
  $: atX2 = getDataAt(getIndicesAndFrac(xs, $x2));

  $: covY1Y2 = gp.cov([$x1, $x2]);
  $: covProps = covEllipse(covY1Y2);

  let points = [];
</script>

<div>
  <h1 class="post-title">Interactive Gaussian Process Visualization</h1>
  <p>
    <em
      >Works best in Chrome, works fine in Firefox; not tested in Safari/Edge.
      Touchscreen support is work-in-progress.</em
    >
  </p>

  <CollapsibleCard open={false}>
    <h3 slot="header">&#187; Explanation</h3>
    <div slot="body">
      A Gaussian process can be thought of as an extension of the multivariate
      normal distribution to an infinite number of random variables covering
      each point on the input domain. The covariance between function values at
      any two points is given by the evaluation of the <em>kernel</em> of the
      Gaussian process. For an in-depth explanation, read this
      <a href="https://distill.pub/2019/visual-exploration-gaussian-processes/"
        >excellent distill.pub article</a
      > and then come back to this interactive visualisation!
    </div>
  </CollapsibleCard>

  <CollapsibleCard open={false}>
    <h3 slot="header">&#187; Instructions</h3>
    <div slot="body" class="text-container">
      <div class="text-explanation" style="grid-area: line;">
        <em>Bottom left:</em>
        Visualises the Gaussian process <Katex math="f(\cdot)" /> through its mean
        (central <span style="color: rgb(0, 100, 100);">d-a-s-h-e-d</span> line)
        and
        <Katex math="\pm \sigma" /> and <Katex math="\pm 2 \sigma" /> confidence
        bands (<span style="background-color: rgb(0, 100, 100, 0.2);"
          >sha<span style="background-color: rgb(0, 100, 100, 0.2);"
            >ded ar</span
          >eas</span
        >). Samples from the Gaussian process are drawn in colored lines. The
        marginal distributions of <Katex math="f(x_1)" /> and <Katex
          math="f(x_2)"
        /> are plotted at the vertical lines at <Katex math="x_1" /> (<span
          style="color: red;">red</span
        >) and <Katex math="x_2" /> (<span style="color: orange;">orange</span
        >). You can change their location by <strong>moving the mouse</strong>
        with or without holding the <strong>Shift key</strong>. You can add
        observations on which to condition the Gaussian process by
        <strong>clicking</strong>
        anywhere in the plot; these observations are drawn as black circles &#9899;.
        To remove an observation, click on it again.
        <small
          ><em>Note:</em> Two observations too close to each other can lead to numerical
          issues and long compute times. If the app seems to hang, reload the page
          to restart.</small
        >
      </div>
      <div class="text-explanation" style="grid-area: kernel;">
        <em>Top left:</em>
        Visualises a slice through the covariance function or kernel <Katex
          math="k(x_i, \cdot)"
        /> as a function of the second argument, for <Katex math="x_i=x_1" />
        (<span style="color: red;">red</span>) and <Katex math="x_i=x_2" /> (<span
          style="color: orange;">orange</span
        >). Circles highlight the values of <Katex math="k(x_1, x_1)" />, <Katex
          math="k(x_1, x_2) = k(x_2, x_1)"
        />, and <Katex math="k(x_2, x_2)" />. You can change the location of <Katex
          math="x_1"
        /> and <Katex math="x_2" /> by <strong>moving the mouse</strong> with or
        without holding the
        <strong>Shift key</strong> and by <strong>touch-moving</strong> with
        <strong>one</strong>
        or <strong>two</strong> fingers.
      </div>
      <div class="text-explanation" style="grid-area: covmat">
        <em>Top right:</em> Displays the entries of the covariance matrix
        <Katex
          math={`\\operatorname{cov}(f(x_1), f(x_2)) = \\begin{pmatrix} k(x_1, x_1) & k(x_1, x_2) \\\\ k(x_2, x_1) & k(x_2, x_2) \\end{pmatrix}`}
        />, corresponding to the circles in the top-left plot, and shows the
        correlation coefficient.
      </div>
      <div class="text-explanation" style="grid-area: covariance;">
        <em>Bottom right:</em>
        Visualises the covariance between <Katex math="f(x_1)" /> and <Katex
          math="f(x_2)"
        />
        (<span style="background-color: rgb(0, 100, 100, 0.2);"
          >sha<span style="background-color: rgb(0, 100, 100, 0.2);"
            >ded ar</span
          >eas</span
        >) and the samples evaluated at those points (colored circles,
        corresponding to the colored lines in the bottom-left plot) as well as
        the marginal distributions of <Katex math="f(x_1)" />
        (<span style="color: red;">red</span>) and
        <Katex math="f(x_2)" />
        (<span style="color: orange;">orange</span>).
      </div>
    </div></CollapsibleCard
  >

  <div>
    <div class="plot-container">
      <div class="chart" style="grid-area: kernel;">
        <Kernelplot {xs} {k1s} {k2s} {atX1} {atX2} />
      </div>
      <div class="chart" style="grid-area: covmat;">
        <CovMat {atX1} {atX2} />
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
          {plotProps}
        />
      </div>
      <div class="squarechart" style="grid-area: covariance;">
        <Covariance {atX1} {atX2} {covProps} {plotProps} />
      </div>
    </div>
  </div>
  <CollapsibleCard open={true}>
    <h3 slot="header">&#187; Visualization settings</h3>
    <div slot="body">
      <RandomSample xsLength={xs.length} bind:doAnimate />
      <div>
        <button
          class="btn"
          disabled={points.length == 0}
          on:click={(_event) => {
            points = [];
          }}>Remove all observations</button
        >
      </div>
    </div>
  </CollapsibleCard>
  <CollapsibleCard open={true}>
    <h3 slot="header">&#187; Kernel and likelihood</h3>
    <div slot="body">
      <ConfigData bind:noiseScale bind:selectedKernel {kernelChoices} />
    </div>
  </CollapsibleCard>
  <CollapsibleCard open={false}>
    <h3 slot="header">&#187; Plotting options</h3>
    <div slot="body">
      <ConfigPlot bind:plotProps bind:num_grid />
    </div>
  </CollapsibleCard>
  <div style="text-align: center;">
    [
    <a href="https://github.com/st--/interactive-gp-visualization/"
      >Source on GitHub</a
    >
    ]
  </div>
</div>

<style>
  .text-container {
    max-width: 1200px;
    display: grid;
    grid-template-columns: auto 350px;
    grid-template-areas:
      "kernel covmat"
      "line covariance";
  }
  .text-explanation {
    margin: 10px;
  }
  .plot-container {
    display: grid;
    height: 550px;
    grid-template-rows: auto 350px;
    grid-template-columns: auto 350px;
    grid-template-areas:
      "kernel covmat"
      "line covariance";
  }
  .chart {
    min-width: 200px;
    /* background-color: #fafafa; */
  }
  .squarechart {
    width: 350px;
    height: 350px;
    padding-right: 30px;
    /* background-color: #fafafa; */
  }
</style>
