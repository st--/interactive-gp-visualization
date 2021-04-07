<script>
  export let xScale, yScale, xTicks, yTicks, width, height, padding;
</script>

<g>
  <!-- y axis -->
  <g class="axis y-axis">
    {#each yTicks as tick}
      <g class="tick tick-{tick}" transform="translate(0, {yScale(tick)})">
        <line x1={padding.left} x2={xScale(xTicks[xTicks.length - 1])} />
        <text x={padding.left - 8} y="+4">{tick}</text>
      </g>
    {/each}
  </g>

  <!-- x axis -->
  <g class="axis x-axis">
    {#each xTicks as tick}
      <g class="tick" transform="translate({xScale(tick)}, 0)">
        <line y1={yScale(yTicks[0])} y2={yScale(yTicks[yTicks.length - 1])} />
        <text y={height - padding.bottom + 16}>{tick}</text>
      </g>
    {/each}
  </g>
</g>

<style>
  .tick line {
    stroke: #ddd;
    stroke-dasharray: 2;
  }

  text {
    font-size: 12px;
    fill: #999;
  }

  .x-axis text {
    text-anchor: middle;
  }

  .y-axis text {
    text-anchor: end;
  }
</style>
