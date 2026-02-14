<script lang="ts">
import { Dropdown } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';
import { kreateApiClient } from '/@/api/client';
import type { CommandDetails } from '/@shared/src/models/CommandDetails';
import SelectOtherModal from '/@/components/SelectOtherModal.svelte';
import type { Resource } from '/@shared/src/KreateApi';

interface Props {
  onselected: (details: CommandDetails | undefined) => void;
  onOtherSelected: (resource: Resource) => void;
}

let { onselected, onOtherSelected }: Props = $props();

let commands = $state<string[]>();
let subcommands = $state<string[]>([]);
let selectOtherResourceModalOpen = $state(false);

let selectedCommand: string | undefined = '';
let selectedSubcommand: string | undefined;

onMount(async () => {
  commands = await kreateApiClient.getCommands();
});

async function getSubcommands(c: string | undefined): Promise<string[]> {
  if (!c) {
    return [];
  }
  return await kreateApiClient.getCommands(c);
}

async function onCommandChange(command: unknown) {
  if (typeof command !== 'string') {
    return;
  }
  if (command === '') {
    onselected(undefined);
  }
  if (command === 'other...') {
    openOtherResourceModal();
    return;
  }
  selectedSubcommand = undefined;
  selectedCommand = command;
  subcommands = await getSubcommands(command);
  if (!subcommands.length) {
    const details = await kreateApiClient.getCommandDetails([command]);
    onselected(details);
  } else {
    onselected(undefined);
  }
}

async function onSubcommandChange(subcommand: unknown) {
  if (!selectedCommand) {
    throw new Error('command should be defined');
  }
  if (typeof subcommand !== 'string') {
    return;
  }
  if (subcommand === '') {
    onselected(undefined);
  }
  selectedSubcommand = subcommand;
  const details = await kreateApiClient.getCommandDetails([selectedCommand, selectedSubcommand]);
  onselected(details);
}

function closeOtherResourceModal(): void {
  selectOtherResourceModalOpen = false;
}

function openOtherResourceModal(): void {
  selectOtherResourceModalOpen = true;
}

function onResourceSelected(resource: Resource): void {
  closeOtherResourceModal();
  onOtherSelected(resource);
}
</script>

<div class="flex flex-row items-center w-full space-x-4">
  <label for="resource">Resource to create: </label>
  {#if commands && commands.length}
    <Dropdown
      id="resource"
      options={[
        { label: '(select a resource)', value: '' },
        ...commands.map(c => ({
          label: c,
          value: c,
        })),
        { label: 'other...', value: 'other...' },
      ]}
      onChange={onCommandChange} />
    {#if subcommands && subcommands.length}
      <Dropdown
        id="subresource"
        options={[
          { label: '(select a resource type)', value: '' },
          ...subcommands.map(c => ({
            label: c,
            value: c,
          })),
        ]}
        onChange={onSubcommandChange} />
    {/if}
  {/if}
</div>

{#if selectOtherResourceModalOpen}
  <SelectOtherModal closeCallback={closeOtherResourceModal} onResourceSelected={onResourceSelected} />
{/if}
