<script>
  // this component uses javascript to implement transitioning
  // for variable height cards
  // it roughly follows technique 3 in the css-trick article linked below
  // https://css-tricks.com/using-css-transitions-auto-dimensions
  import { onMount } from "svelte";
  export let open = false;
  export let className = "card";
  export let duration = 0.2;
  // set the initial value
  let style = open ? "height: auto;" : "height: 0;";
  let prefersReducedMotion = false;
  let transitioning = false;
  let resolveTransitionEnd = null;
  let ref = null;
  $: transition = `height ${duration}s ease`;
  function requestFrame() {
    return new Promise(requestAnimationFrame);
  }
  function transitionEnd() {
    return new Promise((resolve) => {
      resolveTransitionEnd = resolve;
    });
  }
  async function closeCard() {
    if (prefersReducedMotion) {
      style = "height: 0; transition: none;";
      open = false;
      return;
    }
    const scrollHeight = ref.scrollHeight;
    transitioning = true;
    // temporarily turn off transitions
    style = "transition: none;";
    await requestFrame();
    // set height to pixels and turn transitions back on
    style = `height: ${scrollHeight}px; transition: ${transition}`;
    await requestFrame();
    // start the closing transition
    style = `height: 0; transition: ${transition}`;
    // wait for the transition to finish
    await transitionEnd();
    open = false;
    transitioning = false;
  }
  async function openCard() {
    if (prefersReducedMotion) {
      style = `height: ${scrollHeight}px; transition: none;`;
      open = true;
      return;
    }
    const scrollHeight = ref.scrollHeight;
    transitioning = true;
    // start the opening transition to current pixel value
    style = `height: ${scrollHeight}px; transition: ${transition};`;
    // wait for the transition to complete
    await transitionEnd();
    // reset height
    style = `height: auto;`;
    open = true;
    transitioning = false;
  }
  function toggle() {
    if (transitioning) return;
    if (open) closeCard();
    else openCard();
  }
  onMount(() => {
    prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  });
</script>

<div class={className} aria-expanded={open}>
  <div class="header" on:click={() => toggle()}>
    <slot name="header" />
  </div>

  <div
    class="body"
    bind:this={ref}
    {style}
    on:transitionend={resolveTransitionEnd}
  >
    <slot name="body" />
  </div>

  <slot />
</div>

<style>
  .header {
    cursor: pointer;
    user-select: none;
  }
  .body {
    overflow: hidden;
  }
</style>
