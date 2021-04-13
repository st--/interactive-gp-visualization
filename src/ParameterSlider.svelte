<script>
  export let name, formula, value, min, max, step;
</script>

<label>
  {name} \( {formula} = \)
  <input type="number" bind:value {step} />
  <input type="range" bind:value {min} {max} {step} />
</label>

<style>
  label {
    max-width: 500px;
    text-align: right;
  }
  input[type="number"] {
    width: 80px;
  }
</style>
