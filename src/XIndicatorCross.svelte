<script>
  export let xScale, yScale, x, style;

  $: minX = 0; // xs[0];
  $: maxX = 6; // xs[xs.length - 1];
</script>

<line
  x1={xScale(x)}
  x2={xScale(x)}
  y1={yScale(minX)}
  y2={yScale(maxX)}
  {style}
/>
<line
  x1={xScale(minX)}
  x2={xScale(maxX)}
  y1={yScale(x)}
  y2={yScale(x)}
  {style}
/>
