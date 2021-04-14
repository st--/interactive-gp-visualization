<!-- source: https://svelte.dev/repl/49ff6c089825418888cf804d9dde77bc?version=3.37.0 -->
<script>
  import katex from "katex";
  export let math;
  export let displayMode = false;

  const options = {
    displayMode: displayMode,
    throwOnError: false,
  };

  $: katexString = katex.renderToString(math, options);
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/katex@0.13.2/dist/katex.min.css"
    integrity="sha256-pJEAs/zQ2ihefvJlQEQkjHX+H1br8xxfQ2RXWjJtZmE="
    crossorigin="anonymous"
  />
</svelte:head>

{@html katexString}
