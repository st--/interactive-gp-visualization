<!-- Copyright (c) 2021 ST John

To dos:
- proper spacing/(re)sizing of Covariance/Line/Kernel plots
- fix relative size when window too small...
- center/right-align labels instead of manual pixel shifts
- adjust axis ticks when resizing
- Kernel plot: automatic y-axis scaling?
- can we unify XIndicators/YIndicatorBar/YIndicatorCross in a single component?
- convert 1 and 2 sigma to 50/95% confidence ?

More features:
- add two observations when clicking in Covariance plot?
- select prior mean function (linear, quadratic, sine?)
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
  import { CollapsibleCard } from "svelte-collapsible";
  import Katex from "./Katex.svelte";
  import Lineplot from "./Lineplot.svelte";
  import Kernelplot from "./Kernelplot.svelte";
  import Covariance from "./Covariance.svelte";
  import RandomSample from "./RandomSample.svelte";
  import KernelTwoD from "./KernelTwoD.svelte";
  import ConfigPlot from "./ConfigPlot.svelte";
  import ConfigData from "./ConfigData.svelte";
  import { x1, x2, vs } from "./store.js";
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
  import { linspace, matrixSqrt, sampleMvn, covEllipse } from "./mymath.js";
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

  let plotProps = {
    mean: true,
    confidence: true,
    samples: true,
    marginals: true,
  };

  let num_grid = 200;
  let noiseScale = 0.0;
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
  $: means = gp.mean(xs);
  $: covMat = gp.cov(xs);
  $: marginalVariances = covMat.diag();
  $: covSqrt = matrixSqrt(covMat);
  $: samples = sampleMvn(means, covSqrt, $vs);

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
    return { ys, mean, variance };
  };
  $: atX1 = getDataAt(getIndicesAndFrac(xs, $x1));
  $: atX2 = getDataAt(getIndicesAndFrac(xs, $x2));

  $: covY1Y2 = gp.cov([$x1, $x2]);
  $: covProps = covEllipse(covY1Y2);

  let points = [];
</script>

<div>
  <h2>Interactive Gaussian Process Visualization</h2>

  <CollapsibleCard open={false}>
    <h4 slot="header">&#187; Instructions</h4>
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
        anywhere in the plot; these observations are drawn as black circles
        (clicking on an observation removes it again).
        <small
          ><em>Note:</em> Two observations too close to each other can lead to numerical
          issues and long compute times - you may have to reload the page.</small
        >
      </div>
      <div class="text-explanation" style="grid-area: kernel;">
        <em>Top left:</em>
        Visualises a slice through the covariance function or kernel <Katex
          math="k(x_1, \cdot)"
        /> as a function of the second argument. You can change the location of <Katex
          math="x_1"
        /> and <Katex math="x_2" /> by <strong>moving the mouse</strong> with or
        without holding the
        <strong>Shift key</strong>.
      </div>
      <div class="text-explanation" style="grid-area: covariance;">
        <em>Right:</em>
        Visualises the covariance between <Katex math="f(x_1)" /> and <Katex
          math="f(x_2)"
        />
        (<span style="background-color: rgb(0, 100, 100, 0.2);"
          >sha<span style="background-color: rgb(0, 100, 100, 0.2);"
            >ded ar</span
          >eas</span
        >) and the samples evaluated at those points (colored circles,
        corresponding to the colored lines in the bottom-left plot).
      </div>
    </div></CollapsibleCard
  >

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
        {plotProps}
      />
    </div>
    <div class="squarechart" style="grid-area: covariance;">
      <Covariance {atX1} {atX2} {covProps} {plotProps} />
    </div>
  </div>
  <CollapsibleCard open={true}>
    <h4 slot="header">&#187; Full covariance</h4>
    <div slot="body" class="fullcovchart">
      <KernelTwoD {covMat} />
    </div>
  </CollapsibleCard>
  <CollapsibleCard>
    <h4 slot="header">&#187; Visualization settings</h4>
    <div slot="body">
      <RandomSample xsLength={xs.length} />
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
  <CollapsibleCard>
    <h4 slot="header">&#187; Kernel and likelihood</h4>
    <div slot="body">
      <ConfigData bind:noiseScale bind:selectedKernel {kernelChoices} />
    </div>
  </CollapsibleCard>
  <CollapsibleCard open={false}>
    <h4 slot="header">&#187; Plotting options</h4>
    <div slot="body">
      <ConfigPlot bind:plotProps bind:num_grid />
    </div>
  </CollapsibleCard>
  <div>
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
    grid-template-columns: 70% auto;
    grid-template-areas:
      "kernel ."
      "line covariance";
  }
  .text-explanation {
    margin: 10px;
  }
  .plot-container {
    display: grid;
    grid-template-rows: 30% 70%;
    grid-template-columns: 70% 30%;
    grid-template-areas:
      "kernel kernel2d"
      "line covariance";
  }
  .chart {
    background-color: #fafafa;
  }
  .fullcovchart {
    min-width: 400px;
    min-height: 400px;
    background-color: #fafafa;
  }
  .squarechart {
    min-width: 200px;
    min-height: 200px;
    background-color: #fafafa;
  }
</style>
