<script lang="ts">
import type { SimplifiedSpec } from '/@shared/src/models/SimplifiedSpec';

export let spec: SimplifiedSpec;
// prefix for fields names
export let prefix = '';
// is it the top level SpecSimple component?
export let topLevel: boolean = true;
// which field to highlight?
export let highlight: string;
// do we want to highliht the `highlight` field?
export let highlighted: boolean = false;
// do we want to set the Ids for the fields at this level?
export let setIds: boolean = false;
// is the spec passed is a complete spec or a subspec?
export let complete: boolean = false;

function getHtmlParagraphs(s: string): string {
  return '<p>' + s.replaceAll('\n', '</p><p>') + '</p>';
}

$: childrenPrefix =
  (topLevel && complete ? '' : prefix + spec.name) + (spec.isArray ? '[]' : '') + (topLevel && complete ? '' : '.');
</script>

<div class:bg-[var(--pd-content-card-selected-bg)]={highlighted}>
  <div id={setIds ? spec.name : undefined}>
    <span class="font-bold">{prefix}{spec.name}</span>
    {#if spec.type}({spec.type}){/if}
  </div>
  <div>{@html getHtmlParagraphs(spec.description)}</div>
  {#if spec.typeDescription}
    <div class="opacity-70">{@html getHtmlParagraphs(spec.typeDescription)}</div>
  {/if}
  <ul class="ml-4">
    {#each spec.children as child}
      <li class="pt-2">
        <svelte:self
          spec={child}
          prefix={childrenPrefix}
          topLevel={false}
          setIds={topLevel}
          highlighted={topLevel && child.name === highlight} />
      </li>
    {/each}
  </ul>
</div>
