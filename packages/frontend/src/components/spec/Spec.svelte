<script lang="ts">
import type { OpenAPIV3 } from "openapi-types";

export let spec: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
export let prefix: string  = '';
export let maxDepth: number;
export let begin: string[] = [];

$: console.log('==> spec', spec);

function isReferenceObject(spec: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject): spec is OpenAPIV3.ReferenceObject {
  return typeof spec === 'object' && '$ref' in spec;
}

function isSchemaObject(additionalProperties: undefined | boolean | OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject): additionalProperties is OpenAPIV3.SchemaObject {
  return typeof spec === 'object' && !!additionalProperties && typeof additionalProperties !== 'boolean' && 'type' in additionalProperties;
}

function isArraySchemaObject(spec: OpenAPIV3.SchemaObject): spec is OpenAPIV3.ArraySchemaObject {
  return spec.type === 'array';
}
function getType(spec: OpenAPIV3.SchemaObject, options?: { subtype: boolean }): string {
  if (!spec.type) {
    return '';
  }
  let type = `${spec.type}`;
  if (spec.type === 'array' && !isReferenceObject(spec.items)) {
    if (spec.items.allOf?.[0] && !isReferenceObject(spec.items.allOf[0])) {
      type = `[]${getType(spec.items.allOf[0], { subtype: true })}`;
    } else {
      type = `[]${getType(spec.items, { subtype: true })}`;
    }
  }
  if (type === 'object' && isSchemaObject(spec.additionalProperties)) {
    let subtype = `${spec.additionalProperties.type}`;
    if (spec.additionalProperties.format === 'byte') {
      subtype = '[]byte';
    }
    type = `map[string]${subtype}`;
  }
  if (!!type) {
    return options?.subtype ? type : ` (${type})`;
  }
  return '';
}

function getSpecAtPath(spec: OpenAPIV3.SchemaObject, path: string): OpenAPIV3.SchemaObject {
  if (spec.properties?.[path] && !isReferenceObject(spec.properties[path])) {
    return spec.properties[path];
  }
  return {};
}

function isNumeric(value: string) {
    return /^\d+$/.test(value);
}
</script>
{#if begin.length > 1 && !isReferenceObject(spec)}
  <span class="font-mono">.{begin[0]}</span>
  {#if isNumeric(begin[0])}
    <svelte:self begin={begin.slice(1)} maxDepth={maxDepth} prefix={prefix} spec={spec} />
  {:else}
    {#if !!spec.allOf && !isReferenceObject(spec.allOf[0])}
      <svelte:self begin={begin.slice(1)} maxDepth={maxDepth} prefix={prefix} spec={getSpecAtPath(spec.allOf[0], begin[0])} />
    {:else if isArraySchemaObject(spec) && !isReferenceObject(spec.items) && !!spec.items.allOf && !isReferenceObject(spec.items.allOf[0])}
      <svelte:self begin={begin.slice(1)} maxDepth={maxDepth} prefix={prefix} spec={getSpecAtPath(spec.items.allOf[0], begin[0])} />
    {:else}
      <svelte:self begin={begin.slice(1)} maxDepth={maxDepth} prefix={prefix} spec={getSpecAtPath(spec, begin[0])} />
    {/if}
  {/if}
{:else}
  {#if maxDepth >= 0}
    {#if spec && !isReferenceObject(spec)}
      <div>
        <h1>{spec.description}</h1>
        {#if (spec.type === 'object') && !!spec.properties}
          <ul class="ml-4">
          {#each Object.entries(spec.properties) as [property, subSpec]}
            {#if !isReferenceObject(subSpec)}
              <li><b>{prefix}{property}{getType(subSpec)}</b><svelte:self maxDepth={maxDepth-1} prefix='{prefix}{property}.' spec={subSpec} /></li>
            {/if}
          {/each}
          </ul>
        {/if}
        {#if (spec.type === 'array') && !!spec.items && !isReferenceObject(spec.items) && isArraySchemaObject(spec.items)}
          <ul class="ml-4">
          {#each Object.entries(spec.items) as [property, subSpec]}
            {#if !isReferenceObject(subSpec)}
              <li><b>{prefix}{property}{getType(subSpec)}</b><svelte:self maxDepth={maxDepth-1} prefix='{prefix}{property}.' spec={subSpec} /></li>
            {/if}
          {/each}
          </ul>
        {/if}
        {#if !!spec.allOf}
          {#each spec.allOf as allOf}
            <svelte:self maxDepth={maxDepth} prefix={prefix} spec={allOf} />
          {/each}
        {/if}
        {#if isArraySchemaObject(spec) && !isReferenceObject(spec.items) && !!spec.items.allOf}
          {#each spec.items.allOf as allOf}
            <svelte:self maxDepth={maxDepth} prefix={prefix} spec={allOf} />
          {/each}
        {/if}
      </div>
    {/if}
  {/if}
{/if}
