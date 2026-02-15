<script lang="ts">
import { kreateApiClient } from '../api/client';
import { Button, FormPage } from '@podman-desktop/ui-svelte';
import { router } from 'tinro';
import ResourceSelector from './ResourceSelector.svelte';
import type { CommandDetails } from '/@shared/src/models/CommandDetails';
import { tick } from 'svelte';
import Form from './Form.svelte';
import { yamlContent } from '../stores/yamlContent';

let yamlResult = $state<string>('');

let error = $state<string>('');

let details = $state<CommandDetails>();
let args = $state<string[]>();
let options = $state<string[][]>();

function close(): void {
  router.goto('/');
}

function onResourceSelected(commandDetails: CommandDetails | undefined): void {
  details = commandDetails;
  args = details?.args?.map(_a => '') ?? [];
}

async function onResourceCreate() {
  if (!details) {
    return;
  }
  let params: string[] = [...(details.cli ?? [])];
  for (const arg of args ?? []) {
    if (arg.length) {
      params.push(arg);
    }
  }
  for (const option of options ?? []) {
    if (!option) {
      continue;
    }
    if (option.length) {
      params = params.concat(option);
    }
  }
  error = '';
  try {
    yamlResult = await kreateApiClient.executeCommand(params);
    yamlContent.set(yamlResult);
    router.goto('/');
  } catch (err: unknown) {
    error = String(`execute command error: ${err}`);
  }
}

function onOptionsChange(updatedOptions: string[][]) {
  options = updatedOptions;
}

function onArgsChange(updatedArgs: string[]) {
  args = updatedArgs;
}
</script>

<FormPage title="Use a template" onclose={close}>
  {#snippet content()}
    <div class="p-4 w-full h-full bg-[var(--pd-invert-content-bg)]">
      <ResourceSelector onselected={onResourceSelected}></ResourceSelector>
      {#if details}
        <div class="flex flex-col space-y-4 p-2">
          {#if error}
            <div class="text-red-600">{error}</div>
          {/if}
          <Form details={details} onArgsChange={onArgsChange} onOptionsChange={onOptionsChange}></Form>
          <div class="w-full text-right">
            <Button aria-label="view-yaml" on:click={onResourceCreate}>Generate YAML</Button>
          </div>
        </div>
      {/if}
    </div>
  {/snippet}
</FormPage>
