<script lang="ts">
  export let value: number,
    min: number,
    max: number,
    step = 1,
    lowerBound: number = undefined,
    upperBound: number = undefined,
    integer = false,
    style: string,
    id: string = undefined;

  $: maybeValue = value;

  function handleInput() {
    if (maybeValue !== undefined && maybeValue !== null) {
      if (lowerBound !== undefined && maybeValue < lowerBound)
        maybeValue = lowerBound;
      if (upperBound !== undefined && maybeValue > lowerBound)
        maybeValue = upperBound;
      if (integer) maybeValue = Math.round(maybeValue);
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
  {style}
  {id}
/>
