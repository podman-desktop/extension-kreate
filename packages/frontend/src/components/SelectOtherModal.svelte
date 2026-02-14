<script lang="ts">
import { onMount } from 'svelte';
import Dialog from '/@/components/dialog/Dialog.svelte';
import { kreateApiClient } from '/@/api/client';
import type { Resource } from '/@shared/src/KreateApi';

interface Props {
  closeCallback: () => void;
  onResourceSelected: (resource: Resource) => void;
}

let { closeCallback, onResourceSelected }: Props = $props();

let loadingResources = $state(true);
let allResources = $state<Resource[]>([]);

onMount(async () => {
  allResources = await kreateApiClient.fetchAllResources();
  loadingResources = false;
});
</script>

<Dialog title="Select a resource" onclose={closeCallback}>
  {#snippet content()}
    {#if loadingResources}
      <div>Loading resources...</div>
    {:else}
      <table class="bg-[var(--pd-content-card-bg)] table-auto">
        <thead>
          <tr>
            <th class="p-1">API Version</th>
            <th class="p-1">Kind</th>
          </tr>
        </thead>
        <tbody>
          {#each allResources as resource}
            <tr
              onclick={onResourceSelected.bind(undefined, resource)}
              class="cursor-pointer text-[var(--pd-table-body-text)] hover:bg-[var(--pd-content-card-hover-bg)]">
              <td class="p-1">{resource.apiVersion}</td>
              <td class="p-1">{resource.kind}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  {/snippet}
</Dialog>
