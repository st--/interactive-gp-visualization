<script>
	import { onMount } from 'svelte';
	import { scaleLinear } from 'd3-scale';
	import { zip } from 'd3-array';
	import { x1, x2 } from './store.js';
	import { getSVGpoint } from './getsvgpoint.js';
	import Axes from './Axes.svelte';
	import XIndicators from './XIndicators.svelte';
	export let xs, ys;

	let svg;
	let width = 500;
	let height = 200;

	const padding = { top: 20, right: 40, bottom: 40, left: 25 };

	$: xTicks = [0, 1, 2, 3, 4, 5, 6];

	// TODO add negative y-ticks when conditioning
	$: yTicks = height > 180 ?
		[0, 0.5, 1] :
		[0, 1];

	$: xScale = scaleLinear()
		.domain([minX, maxX])
		.range([padding.left, width - padding.right]);

	$: yScale = scaleLinear()
		.domain([minY, maxY])
		.range([height - padding.bottom, padding.top]);

	$: minX = xs[0];
	$: maxX = xs[xs.length - 1];
	$: minY = Math.min.apply(null, yTicks);
	$: maxY = Math.max.apply(null, yTicks);
	$: path = `M${zip(xs, ys).map(p => `${xScale(p[0])},${yScale(p[1])}`).join('L')}`;
	$: console.log(`path: ${minX} ${maxX} xS0 ${xScale(0)} xs6 ${xScale(6)}`)

	$: area = `${path}L${xScale(maxX)},${yScale(0)}L${xScale(minX)},${yScale(0)}Z`;

	onMount(resize);

	function resize() {
		({ width, height } = svg.getBoundingClientRect());
	}
	function handleClick(event) {
		x1.set(xScale.invert(getSVGpoint(svg, event).x));
	}
	function handleMousemove(event) {
		x2.set(xScale.invert(getSVGpoint(svg, event).x));
	}
</script>

<svelte:window on:resize='{resize}' />

<svg bind:this={svg} on:mousemove={handleMousemove} on:click={handleClick}>

	<Axes {xScale} {yScale} {xTicks} {yTicks} {width} {height} {padding} />
	<XIndicators {xScale} y1={yScale(yTicks[0])} y2={yScale(2)} />

	<!-- data -->
		<path class="path-line" d={path}></path>
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
</style>
