<script lang="ts">
  import { x1, x2 } from "./store.js";
  export let xScale: (x: number) => number,
    yScale: (y: number) => number,
    y1: number,
    y2: number;
</script>

<line
  x1={xScale($x1)}
  x2={xScale($x1)}
  y1={yScale(y1)}
  y2={yScale(y2)}
  style="stroke: red; stroke-width: 2"
/>
<line
  x1={xScale($x2)}
  x2={xScale($x2)}
  y1={yScale(y1)}
  y2={yScale(y2)}
  style="stroke: orange; stroke-width: 2"
/>
