declare module "svelte-collapsible" {
  import { SvelteComponentTyped } from "svelte";
  export class CollapsibleCard extends SvelteComponentTyped<{
    open: boolean;
  }> {}
}
