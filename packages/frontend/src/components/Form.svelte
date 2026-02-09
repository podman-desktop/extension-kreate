<script lang="ts">
import { Input } from '@podman-desktop/ui-svelte';
import { isCommandOptionBoolean, isCommandOptionNumber, type CommandDetails } from '/@shared/src/models/CommandDetails';
import MultipleKeyValueOption from './options/MultipleKeyValueOption.svelte';
import SingleStringOption from './options/SingleStringOption.svelte';
import MultipleStringOption from './options/MultipleStringOption.svelte';
import SingleFileOption from './options/SingleFileOption.svelte';
import MultipleFileOption from './options/MultipleFileOption.svelte';
import MultipleKeyFileOption from './options/MultipleKeyFileOption.svelte';
import SingleBooleanOption from './options/SingleBooleanOption.svelte';
import SingleNumberOption from './options/SingleNumberOption.svelte';
import SinglePasswordOption from './options/SinglePasswordOption.svelte';
import { onMount } from 'svelte';

interface Props {
  details: CommandDetails;
  onArgsChange: (_args: string[]) => void;
  onOptionsChange: (_options: string[][]) => void;
}

let { details, onArgsChange, onOptionsChange }: Props = $props();

let options: string[][] = [];
let args: string[] = [];

onMount(() => {
  options = details?.options?.map(_o => []) ?? [];
  args = details?.args?.map(_a => '') ?? [];
});

function onArgChange(event: Event, i: number) {
  const inputEvent = event as Event & { target: HTMLInputElement };
  args[i] = inputEvent.target.value;
  onArgsChange(args);
}
</script>

<div>
  {#if details}
    <div class="w-full mt-8">
      {#if details.args}
        {#each details.args as arg, i}
          <div class="flex flex-col w-full">
            <label for={`arg-${i}`}>{arg.label}</label>
            <div class="text-sm opacity-50">{arg.description}</div>
            <Input id={`arg-${i}`} on:input={(event: Event) => onArgChange(event, i)} />
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
                onOptionsChange(options);
              }} />
          {/if}
          {#if option.type === 'key-secret' && option.multiple}
            <MultipleKeyValueOption
              valueIsSecret={true}
              option={option}
              onChange={kvs => {
                options[i] = kvs;
                onOptionsChange(options);
              }} />
          {/if}
          {#if option.type === 'string' && !option.multiple}
            <SingleStringOption
              option={option}
              onChange={val => {
                options[i] = val;
                onOptionsChange(options);
              }} />
          {/if}
          {#if option.type === 'string' && option.multiple}
            <MultipleStringOption
              option={option}
              onChange={val => {
                options[i] = val;
                onOptionsChange(options);
              }} />
          {/if}
          {#if option.type === 'password' && !option.multiple}
            <SinglePasswordOption
              option={option}
              onChange={val => {
                options[i] = val;
                onOptionsChange(options);
              }} />
          {/if}
          {#if option.type === 'file' && !option.multiple}
            <SingleFileOption
              selectors={['openFile']}
              option={option}
              onChange={val => {
                options[i] = val;
                onOptionsChange(options);
              }} />
          {/if}
          {#if option.type === 'file' && option.multiple}
            <MultipleFileOption
              selectors={['openFile']}
              option={option}
              onChange={val => {
                options[i] = val;
                onOptionsChange(options);
              }} />
          {/if}
          {#if option.type === 'key-fileOrDirectory' && option.multiple}
            <MultipleKeyFileOption
              selectors={['openFile', 'openDirectory']}
              option={option}
              onChange={val => {
                options[i] = val;
                onOptionsChange(options);
              }} />
          {/if}
          {#if option.type === 'boolean' && isCommandOptionBoolean(option)}
            <SingleBooleanOption
              option={option}
              onChange={val => {
                options[i] = val;
                onOptionsChange(options);
              }} />
          {/if}
          {#if option.type === 'number' && isCommandOptionNumber(option)}
            <SingleNumberOption
              option={option}
              onChange={val => {
                options[i] = val;
                onOptionsChange(options);
              }} />
          {/if}
        {/each}
      {/if}
    </div>
  {/if}
</div>
