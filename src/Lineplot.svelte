<script>
	import { onMount } from 'svelte';
	import { scaleLinear, scaleOrdinal } from 'd3-scale';
	import { schemeCategory10 } from 'd3-scale-chromatic';
	import { zip } from 'd3-array';
	import { x1, x2 } from './store.js';
	import { getSVGpoint } from './getsvgpoint.js';
	import Axes from './Axes.svelte';
	import XIndicators from './XIndicators.svelte';
	export let xs, means, confidence, samples, points, ysAtX1, ysAtX2;

	let svg;
	let width = 500;
	let height = 200;

	const padding = { top: 20, right: 40, bottom: 40, left: 25 };

	$: xTicks = [0, 1, 2, 3, 4, 5, 6];

	$: yTicks = height > 180 ?
		[-3, -2, -1, 0, 1, 2, 3] :
		[-3, 0, 3];

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
	
	function pathGenerator(xs, xScale, yScale) {
		return (ys, reversed) => {
			const zipped = reversed ? zip(xs, ys).reverse() : zip(xs, ys);
			const points = zipped.map(p => `${xScale(p[0])},${yScale(p[1])}`);
			return `M${points.join('L')}`;
		}
	}
	$: makePath = pathGenerator(xs, xScale, yScale);
	$: samplePaths = samples.transpose().to2DArray().map(makePath);
	
	$: pathMean = makePath(means);
	$: confidenceLower = means.map((mean, idx) => mean - confidence[idx]);
	$: confidenceUpper = means.map((mean, idx) => mean + confidence[idx]);
	$: areaConfidence = `${makePath(confidenceLower)}L${makePath(confidenceUpper, true).slice(1)}Z`;

	onMount(resize);

	function resize() {
		({ width, height } = svg.getBoundingClientRect());
	}
	function handleClick(event) {
		const pt = getSVGpoint(svg, event);
		const newX = xScale.invert(pt.x);
		const newY = yScale.invert(pt.y);
		points = points.concat({'x': newX, 'y': newY});
	}
	function handleMousemove(event) {
		x2.set(xScale.invert(getSVGpoint(svg, event).x));
	}
	function removePoint(point, event) {
		event.stopPropagation();
		points = points.filter(element => element != point);
	}

	// TODO unify with Covariance.svelte?
	const sampleColor = scaleOrdinal(schemeCategory10);
</script>

<svelte:window on:resize='{resize}' />

<svg bind:this={svg} on:mousemove={handleMousemove} on:click={handleClick}>

	<Axes {xScale} {yScale} {xTicks} {yTicks} {width} {height} {padding} />
	<XIndicators {xScale} y1={yScale(minY)} y2={yScale(maxY)} />
	
	<!-- data -->
	<path class="path-area" d={areaConfidence}></path>
	<path class="path-line" d={pathMean}></path>

	{#each samplePaths as path, i}
		<path class="path-line" d={path} style="stroke: {sampleColor(i)};"></path>
	{/each}

	{#each ysAtX1 as y1, i}
		<circle cx='{xScale($x1)}' cy='{yScale(y1)}' r='3' style="fill: {sampleColor(i)};" />
	{/each}
	{#each ysAtX2 as y2, i}
		<circle cx='{xScale($x2)}' cy='{yScale(y2)}' r='3' style="fill: {sampleColor(i)};" />
	{/each}

	{#each points as point}
		<circle cx='{xScale(point.x)}' cy='{yScale(point.y)}' r='5'
			on:click="{event => removePoint(point, event)}" />
		<!-- see https://svelte.dev/examples#7guis-circles -->
	{/each}
</svg>

<style>
	svg {
		width: 50%;
		height: 50%;
		float: left;
	}

	circle {
		fill: orange;
		fill-opacity: 0.6;
		stroke: rgba(0,0,0,0.5);
	}

	.path-line {
		fill: none;
		stroke: rgb(0,100,100);
		stroke-linejoin: round;
		stroke-linecap: round;
		stroke-width: 2;
	}

	.path-area {
		fill: rgba(0,100,100,0.2);
	}
</style>
