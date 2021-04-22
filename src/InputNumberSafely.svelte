<script>
  export let value,
    min,
    max,
    step = 1,
    lowerBound,
    upperBound;
  $: maybeValue = value;
  function handleInput() {
    if (maybeValue !== undefined && maybeValue !== null) {
      if (lowerBound !== undefined && maybeValue < lowerBound)
        maybeValue = lowerBound;
      if (upperBound !== undefined && maybeValue > lowerBound)
        maybeValue = upperBound;
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
