<script>
	import { onMount } from 'svelte';
	import { scaleLinear } from 'd3-scale';
	import { zip } from 'd3-array';
	import { x1, x2 } from './store.js';
	import { getSVGpoint } from './getsvgpoint.js';
	import Axes from './Axes.svelte';
	export let xs, means, confidence, samples, points;

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
		return (ys) => {
			const points = zip(xs, ys).map(p => `${xScale(p[0])},${yScale(p[1])}`);
			return `M${points.join('L')}`;
		}
	}
	$: makePath = pathGenerator(xs, xScale, yScale);
	$: samplePaths = samples.map(makePath);
	
	$: pathMean = makePath(means);
// 	$: confidenceLower = zip(means, confidence).map((m, c) => m + c);
	$: console.log(`Lineplot: ${width} xs0 ${xScale(0)} xs6 ${xScale(6)} ${samples}`);
	$: areaConfidence = `${makePath(confidence)}L${xScale(maxX)},${yScale(0)}L${xScale(minX)},${yScale(0)}Z`;

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
</script>

<svelte:window on:resize='{resize}' />

width={width} height={height}
<svg bind:this={svg} on:mousemove={handleMousemove} on:click={handleClick}>
  <line x1='{xScale($x1)}' x2='{xScale($x1)}' y1='{yScale(-2)}' y2='{yScale(2)}' style="stroke:rgb(255,0,0);stroke-width:2" />
  <line x1='{xScale($x2)}' x2='{xScale($x2)}' y1='{yScale(-2)}' y2='{yScale(2)}' style="stroke:rgb(255,0,0);stroke-width:2" />

	<Axes {xScale} {yScale} {xTicks} {yTicks} {width} {height} {padding} />
	
	<!-- data -->
		<path class="path-area" d={areaConfidence}></path>
		<path class="path-line" d={pathMean}></path>
	{#each samplePaths as path}
		<path class="path-line" d={path}></path>
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
