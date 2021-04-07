<script>
	import { onMount } from 'svelte';
	import { scaleLinear } from 'd3-scale';
	import { zip } from 'd3-array';
	import Axes from './Axes.svelte';
	export let ysAtX1, ysAtX2, covProps;

	let svg;
	let width = 200;
	let height = 200;

	const padding = { top: 20, right: 40, bottom: 40, left: 25 };

	$: yTicks = height > 180 ?
		[-3, -2, -1, 0, 1, 2, 3] :
		[-3, 0, 3];
	$: xTicks = yTicks;

	$: xScale = scaleLinear()
		.domain([minY, maxY])
		.range([padding.left, width - padding.right]);

	$: yScale = scaleLinear()
		.domain([minY, maxY])
		.range([height - padding.bottom, padding.top]);
	
	$: yFactor = Math.abs((yScale(maxY) - yScale(minY)) / (maxY - minY));
	$: console.log(yFactor);
	
	$: yPairs = zip(ysAtX1, ysAtX2);

	$: minY = Math.min.apply(null, yTicks);
	$: maxY = Math.max.apply(null, yTicks);
	
	onMount(resize);

	function resize() {
		({ width, height } = svg.getBoundingClientRect());
	}
</script>

<svelte:window on:resize='{resize}' />

<svg bind:this={svg}>
	<Axes {xScale} {yScale} {xTicks} {yTicks} {width} {height} {padding} />
	
	<!-- data -->
	<g transform="rotate({covProps.angle} {xScale(0)} {yScale(0)})">
		<ellipse cx='{xScale(0)}' cy='{yScale(0)}' rx='{yFactor * covProps.width}' ry='{yFactor * covProps.length}' />
	</g>

	{#each yPairs as ys}
		<circle cx='{xScale(ys[0])}' cy='{yScale(ys[1])}' r='3' />
	{/each}
</svg>

<style>
	svg {
		width: 50%;
		height: 50%;
		float: left;
	}

	ellipse {
		fill-opacity: 0.1;
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

