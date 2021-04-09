<script>
  import { x1, x2, y1, y2 } from "./store.js";
  export let xScale, yScale;
  const halfwidth = 5;
</script>

<line
  x1={xScale($x1) - halfwidth}
  x2={xScale($x1) + halfwidth}
  y1={yScale($y1)}
  y2={yScale($y1)}
  style="stroke: red; stroke-width: 2;"
/>
<line
  x1={xScale($x2) - halfwidth}
  x2={xScale($x2) + halfwidth}
  y1={yScale($y2)}
  y2={yScale($y2)}
  style="stroke: orange; stroke-width: 2;"
/>
