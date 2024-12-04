<script lang="ts">
import { Button, Dropdown, Input } from '@podman-desktop/ui-svelte';
import { kreateApiClient } from './api/client';
import { onMount } from 'svelte';
import MultipleKeyValueOption from './components/options/MultipleKeyValueOption.svelte';
import type { CommandDetails } from '/@shared/src/models/CommandDetails';
import SingleStringOption from './components/options/SingleStringOption.svelte';
import MultipleStringOption from './components/options/MultipleStringOption.svelte';
import SinglePasswordOption from './components/options/SinglePasswordOption.svelte';
import SingleFileOption from './components/options/SingleFileOption.svelte';
import MultipleFileOption from './components/options/MultipleFileOption.svelte';
import MultipleKeyFileOption from './components/options/MultipleKeyFileOption.svelte';

let selectedCommand: string | undefined = '';
let selectedSubcommand: string | undefined;
let details: CommandDetails;

let commands: string[] = [];
let subcommands: string[] = [];

let args: string[];
let options: string[][];

let yamlResult: string;
let error: string = '';

let createError: string = '';
let createdYaml = '';

onMount(async () => {
  commands = await kreateApiClient.getCommands();
});

async function onCommandChange(command: unknown) {
  if (typeof command !== 'string') {
    return;
  }
  selectedSubcommand = undefined;
  selectedCommand = command;
  subcommands = await getSubcommands(command);
  if (!subcommands.length) {
    details = await kreateApiClient.getCommandDetails([command]);
    initFormValues(details);
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
  details = await kreateApiClient.getCommandDetails([selectedCommand, selectedSubcommand]);
  initFormValues(details);
}

async function getSubcommands(c: string | undefined): Promise<string[]> {
  if (!c) {
    return [];
  }
  return await kreateApiClient.getCommands(c);
}

function initFormValues(details: CommandDetails) {
  args = details.args?.map(_a => '') ?? [];
  options = details.options?.map(_o => []) ?? [];
}

async function createResource() {
  if (!selectedCommand) {
    return;
  }
  let params: string[] = [...details.cli ?? []];
  for (const arg of args) {
    if (arg.length) {
      params.push(arg);
    }
  }
  for (const option of options) {
    if (option.length) {
      params = params.concat(option);
    }
  }
  error = '';
  try {
    yamlResult = await kreateApiClient.executeCommand(params);
  } catch (err: unknown) {
    error = String(err);
  }
}

async function create() {
  createError = '';
  try {
    await kreateApiClient.create(yamlResult);
    createdYaml = yamlResult;
  } catch (err: unknown) {
    createError = String(err);    
  }
}
</script>

<div class="p-4 flex flex-col space-y-4 h-full w-full bg-[var(--pd-content-card-bg)]">
  <div class="flex flex-row items-start w-full space-x-4">
    <textarea
      class="w-full p-2 outline-none text-sm bg-[var(--pd-input-field-focused-bg)] rounded-sm text-[var(--pd-input-field-focused-text)] placeholder-[var(--pd-input-field-placeholder-text)]"
      rows="20"
      bind:value={yamlResult}>
    </textarea>
    <Button on:click={create} disabled={!yamlResult || yamlResult === createdYaml}>Create</Button>
  </div>

  {#if createError}
    <div class="text-red-600">{createError}</div>
  {/if}

  <div class="flex flex-row items-center w-full space-x-4">
    <label for="resource">Resource to create: </label>
    {#if commands && commands.length}
      <Dropdown
        id="resource"
        options={[{ label: '(select a resource)', value: ''}, ...commands.map(c => ({
          label: c,
          value: c,
        }))]}
        onChange={onCommandChange} />
      {#if subcommands && subcommands.length}
        <Dropdown
          id="subresource"
          options={[{ label: '(select a resource type)', value: ''}, ...subcommands.map(c => ({
            label: c,
            value: c,
          }))]}
          onChange={onSubcommandChange} />
      {/if}
      <Button on:click={createResource}>View YAML</Button>
    {/if}
  </div>

  {#if error}
    <div class="text-red-600">{error}</div>
  {/if}

  <div class="h-full w-full overflow-y-auto">
    {#if details}
      <div class="w-full mt-8">
        {#if details.args}
          {#each details.args as arg, i}
            <div class="flex flex-col w-full">
              <label for={`arg-${i}`}>{arg.label}</label>
              <div class="text-sm opacity-50">{arg.description}</div>
              <Input id={`arg-${i}`} bind:value={args[i]} />
            </div>
          {/each}
        {/if}
        {#if details.options}
          {#each details.options as option, i}
            <div class="mt-4 font-medium">{option.label}</div>
            <div class="text-sm opacity-50">{option.description}</div>
            {#if option.type === 'key-value' && option.multiple}
              <MultipleKeyValueOption
                option={option}
                onChange={kvs => {
                  options[i] = kvs;
                  options = options;
                }} />
            {/if}
            {#if option.type === 'string' && !option.multiple}
              <SingleStringOption
                option={option}
                onChange={val => {
                  options[i] = val;
                  options = options;
                }} />
            {/if}
            {#if option.type === 'string' && option.multiple}
              <MultipleStringOption
                option={option}
                onChange={val => {
                  options[i] = val;
                  options = options;
                }} />
            {/if}
            {#if option.type === 'password' && !option.multiple}
              <SinglePasswordOption
                option={option}
                onChange={val => {
                  options[i] = val;
                  options = options;
                }} />
            {/if}
            {#if option.type === 'file' && !option.multiple}
              <SingleFileOption
                selectors={['openFile']}
                option={option}
                onChange={val => {
                  options[i] = val;
                  options = options;
                }} />
            {/if}
            {#if option.type === 'file' && option.multiple}
              <MultipleFileOption
                selectors={['openFile']}
                option={option}
                onChange={val => {
                  options[i] = val;
                  options = options;
                }} />
            {/if}
            {#if option.type === 'key-fileOrDirectory' && option.multiple}
              <MultipleKeyFileOption
                selectors={['openFile', 'openDirectory']}
                option={option}
                onChange={val => {
                  options[i] = val;
                  options = options;
                }} />
            {/if}
          {/each}
        {/if}
      </div>
    {/if}
  </div>
</div>
