<script>
  export let name, value, min, max, step;
</script>

<label>
  {name}:
  <input type="number" bind:value {step} />
  <input type="range" bind:value {min} {max} {step} />
</label>
