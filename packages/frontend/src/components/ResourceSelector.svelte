<script lang="ts">
import { Button, Dropdown } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';
import { kreateApiClient } from '../api/client';
import type { CommandDetails } from '/@shared/src/models/CommandDetails';

interface Props {
  onselected: (details: CommandDetails) => void;
  oncreate: () => void;
}

let { onselected, oncreate }: Props = $props();

let commands = $state<string[]>();
let subcommands = $state<string[]>([]);

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
  selectedSubcommand = undefined;
  selectedCommand = command;
  subcommands = await getSubcommands(command);
  if (!subcommands.length) {
    const details = await kreateApiClient.getCommandDetails([command]);
    onselected(details);
  }
}

async function onSubcommandChange(subcommand: unknown) {
  if (!selectedCommand) {
    throw new Error('command should be defined');
  }
  if (typeof subcommand !== 'string') {
    return;
  }
  selectedSubcommand = subcommand;
  const details = await kreateApiClient.getCommandDetails([selectedCommand, selectedSubcommand]);
  onselected(details);
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
    <Button aria-label="view-yaml" on:click={oncreate}>View YAML</Button>
  {/if}
</div>
