<script lang="ts">
import type { SimplifiedSpec } from '/@shared/src/models/SimplifiedSpec';
import SpecSimple from './SpecSimple.svelte';

interface Props {
  spec: SimplifiedSpec;
  // prefix for fields names
  prefix?: string;
  // is it the top level SpecSimple component?
  topLevel?: boolean;
  // which field to highlight?
  highlight?: string;
  // do we want to highliht the `highlight` field?
  highlighted?: boolean;
  // do we want to set the Ids for the fields at this level?
  setIds?: boolean;
  // is the spec passed is a complete spec or a subspec?
  complete?: boolean;
}

let {
  spec,
  prefix = '',
  topLevel = true,
  highlight,
  highlighted = false,
  setIds = false,
  complete = false,
}: Props = $props();

function getHtmlParagraphs(s: string): string {
  return '<p>' + s.replaceAll('\n', '</p><p>') + '</p>';
}

const childrenPrefix = $derived(
  (topLevel && complete ? '' : prefix + spec.name) + (spec.isArray ? '[]' : '') + (topLevel && complete ? '' : '.'),
);
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
        <SpecSimple
          spec={child}
          prefix={childrenPrefix}
          topLevel={false}
          setIds={topLevel}
          highlighted={topLevel && child.name === highlight} />
      </li>
    {/each}
  </ul>
</div>
