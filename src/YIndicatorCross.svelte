<script lang="ts">
  import { y1, y2 } from "./store.js";
  export let xScale: (x: number) => number,
    yScale: (y: number) => number,
    maxY: number;
  const halfwidth = 5;
</script>

<line
  x1={xScale($y1)}
  x2={xScale($y1)}
  y1={yScale(maxY) - halfwidth}
  y2={yScale(maxY) + halfwidth}
  style="stroke: red; stroke-width: 2;"
/>
<line
  x1={xScale(maxY) - halfwidth}
  x2={xScale(maxY) + halfwidth}
  y1={yScale($y2)}
  y2={yScale($y2)}
  style="stroke: orange; stroke-width: 2;"
/>
