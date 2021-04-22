<script>
  export let value,
    min,
    max,
    step = 1;
  let maybeValue = value;
  function handleInput() {
    if (maybeValue !== undefined && maybeValue !== null) {
      value = maybeValue;
    }
  }
</script>

<input
  type="number"
  bind:value={maybeValue}
  {min}
  {max}
  {step}
  on:input={handleInput}
/>
