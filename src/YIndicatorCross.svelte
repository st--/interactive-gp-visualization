<script>
  import { y1, y2 } from "./store.js";
  export let xScale, yScale, minY, maxY;
</script>

<line
  x1={xScale($y1)}
  x2={xScale($y1)}
  y1={yScale(minY)}
  y2={yScale(maxY)}
  style="stroke: red; stroke-width: 2;"
/>
<line
  x1={xScale(minY)}
  x2={xScale(maxY)}
  y1={yScale($y2)}
  y2={yScale($y2)}
  style="stroke: orange; stroke-width: 2;"
/>
