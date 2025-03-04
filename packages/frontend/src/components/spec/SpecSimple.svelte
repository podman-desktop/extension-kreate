<script lang="ts">
import type { SimplifiedSpec } from '/@shared/src/models/SimplifiedSpec';

export let spec: SimplifiedSpec;
export let prefix = '';
export let topLevel: boolean = true;
export let highlight: string;
export let highlighted: boolean = false;

function getHtmlParagraphs(s: string): string {
  return '<p>' + s.replaceAll('\n', '</p><p>') + '</p>';
}

$: childrenPrefix = (topLevel ? '' : prefix + spec.name) + (spec.isArray ? '[]' : '') + (topLevel ? '' : '.');
</script>

<div class:bg-[var(--pd-content-card-selected-bg)]={highlighted}>
  <div id={spec.name}>
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
          highlighted={topLevel && child.name === highlight} />
      </li>
    {/each}
  </ul>
</div>
