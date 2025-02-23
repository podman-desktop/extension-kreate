<script lang="ts">
import { Button, Dropdown, Input } from '@podman-desktop/ui-svelte';
import { kreateApiClient } from './api/client';
import { onMount, tick } from 'svelte';
import MultipleKeyValueOption from './components/options/MultipleKeyValueOption.svelte';
import { isCommandOptionBoolean, isCommandOptionNumber, type CommandDetails } from '/@shared/src/models/CommandDetails';
import SingleStringOption from './components/options/SingleStringOption.svelte';
import MultipleStringOption from './components/options/MultipleStringOption.svelte';
import SinglePasswordOption from './components/options/SinglePasswordOption.svelte';
import SingleFileOption from './components/options/SingleFileOption.svelte';
import MultipleFileOption from './components/options/MultipleFileOption.svelte';
import MultipleKeyFileOption from './components/options/MultipleKeyFileOption.svelte';
import SingleBooleanOption from './components/options/SingleBooleanOption.svelte';
import SingleNumberOption from './components/options/SingleNumberOption.svelte';
import type { OpenAPIV3 } from 'openapi-types';
import Spec from './components/spec/Spec.svelte';
import { TOP } from './components/spec/Spec';
import ResourceSelector from './components/ResourceSelector.svelte';

let details: CommandDetails;

let commands: string[] = [];

let args: string[];
let options: string[][];

let yamlResult: string;
let error: string = '';

let createError: string = '';
let createdYaml = '';

let spec: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined;
let cursorLine: number = 0;
let cursorLineIsEmpty = false;
let emptyLineIndentation = 0;
let pathInSpec: string[] = [];

let yamlEditor: HTMLTextAreaElement;

$: updateSpec(yamlResult, cursorLine, cursorLineIsEmpty, emptyLineIndentation);

async function updateSpec(
  yamlResult: string,
  cursorLine: number,
  cursorLineIsEmpty: boolean,
  emptyLineIndentation: number,
) {
  try {
    spec = await kreateApiClient.getSpecFromYamlManifest(yamlResult);
    let path = await kreateApiClient.getPathAtPosition(yamlResult, cursorLine);
    if (cursorLineIsEmpty) {
      path = path.filter(p => !isNumeric(p)).slice(0, emptyLineIndentation);
    }
    pathInSpec = path;
  } catch {}
}

onMount(async () => {
  const state = await kreateApiClient.getState();
  yamlResult = state.content;
  commands = await kreateApiClient.getCommands();
});

function onResourceSelected(commandDetails: CommandDetails): void {
  details = commandDetails;
  args = details.args?.map(_a => '') ?? [];
  options = details.options?.map(_o => []) ?? [];
}

async function onResourceCreate() {
  if (!details) {
    return;
  }
  let params: string[] = [...(details.cli ?? [])];
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
    await tick();
    yamlEditor.focus();
    yamlEditor.setSelectionRange(0, 0);
    yamlEditor.scrollTo({ top: 0 });
  } catch (err: unknown) {
    error = String(`execute command error: ${err}`);
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

async function onValueChange(event: Event) {
  const textareaEvent = event as Event & { target: HTMLTextAreaElement };
  yamlResult = textareaEvent.target.value;
  onCursorChange(textareaEvent.target.selectionStart);
}

async function onCursorChange(position: number) {
  if (!yamlResult) {
    return;
  }
  const lines = yamlResult.substring(0, position).split(/\r\n|\r|\n/);
  const currentLine = yamlResult.split(/\r\n|\r|\n/)[lines.length - 1];
  cursorLineIsEmpty = currentLine.trim() === '';
  if (cursorLineIsEmpty) {
    emptyLineIndentation = Math.floor(currentLine.length / 2);
  }
  cursorLine = lines.length - 1;
}

function getScrollTo(paths: string[]): string {
  if (!paths.length) {
    return TOP;
  }
  return paths.slice(-1)[0];
}

function isNumeric(value: string) {
  return /^\d+$/.test(value);
}
</script>

<div class="p-4 flex flex-col space-y-4 h-full w-full bg-[var(--pd-content-card-bg)]">
  <div class="flex flex-row items-start w-full h-full space-x-4 basis-1/2 max-h-64">
    <textarea
      bind:this={yamlEditor}
      class="font-mono max-h-64 basis-1/2 w-full p-2 outline-none text-sm bg-[var(--pd-input-field-focused-bg)] rounded-sm text-[var(--pd-input-field-focused-text)] placeholder-[var(--pd-input-field-placeholder-text)]"
      rows="10"
      on:selectionchange={e => onCursorChange((e.target as HTMLTextAreaElement).selectionStart)}
      on:input={onValueChange}
      value={yamlResult}></textarea>
    <div class="flex flex-col basis-1/2 h-full space-y-2">
      <Button on:click={create} disabled={!yamlResult || yamlResult === createdYaml}>Create</Button>
      <div class="w-full h-full overflow-y-auto">
        {#if spec}<Spec begin={pathInSpec} spec={spec} scrollTo={getScrollTo(pathInSpec)} />{/if}
      </div>
    </div>
  </div>

  {#if createError}
    <div class="text-red-600">{createError}</div>
  {/if}

  <ResourceSelector onselected={onResourceSelected} oncreate={onResourceCreate}></ResourceSelector>

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
            {#if option.type === 'boolean' && isCommandOptionBoolean(option)}
              <SingleBooleanOption
                option={option}
                onChange={val => {
                  options[i] = val;
                  options = options;
                }} />
            {/if}
            {#if option.type === 'number' && isCommandOptionNumber(option)}
              <SingleNumberOption
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
