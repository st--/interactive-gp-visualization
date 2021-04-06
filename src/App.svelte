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
<script>
	import Lineplot from './Lineplot.svelte';
	import Kernelplot from './Kernelplot.svelte';
	import { x1, x2 } from './store.js';
	import { sqexp, matern12, white, sumKernel, covMatrix } from './kernels.js';
	import { linspace, matrixSqrt, randn, sampleMvn } from './mymath.js';
	
	let num_grid = 40;
	$: xs = linspace(0, 6, num_grid);
	
	const k = sqexp();
	
	$: k1s = xs.map(x => k($x1, x));
	$: means = xs.map(x => 0.0);
	$: confidence = xs.map(x => 2 * Math.sqrt(k(x, x)));  // +/- 2 standard deviations
	$: covMat = covMatrix(sumKernel([k, white(1e-6)]), xs);
	$: covSqrt = matrixSqrt(covMat);
	function createSampler(means, covSqrt, numSamples) {
    return () => { return sampleMvn(means, covSqrt, numSamples).transpose().to2DArray(); }
	}
	$: generateSample = createSampler(means, covSqrt, 3);
	let samples = generateSample();
	$: console.log(k1s);
	$: console.log(samples);
	// plot!
	let points = [
    {'x': 1.1, 'y': 1.5},
		{'x': 2.5, 'y': -0.5}
	];
</script>

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
<div>
	The mouse position is {$x2}.
	Last clicked on {$x1}.
	
	<h2>Visualization</h2>

	<div style="display: grid;">
		<div class="chart" style="grid-row: 1; grid-column: 1;">
			<Kernelplot xs={xs} ys={k1s} />
		</div>
		<div class="chart" style="grid-row: 2; grid-column: 1;">
			<Lineplot {xs} {means} {confidence} {samples} {points} />
		</div>
	</div>
<!-- 	<button on:click={() => { samples = generateSample(); }}> -->
	  Resample
<!-- 	</button> -->
</div>