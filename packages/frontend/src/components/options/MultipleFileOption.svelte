<script lang="ts">
import { Button, Input } from '@podman-desktop/ui-svelte';
import type { CommandOption } from '/@shared/src/models/CommandDetails';
import { faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import FileInput from '../ui/FileInput.svelte';

export let option: CommandOption;
export let onChange = (_value: string[]) => {};
export let selectors: ('openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles')[];

let values: string[] = [''];

function deleteValue(index: number) {
  values = values.filter((_, i) => i !== index);
  onChange(getValue(values));
}

function addValue() {
  values.push('');
  values = values;
}

function onFileChange(value: string, i: number) {
  values[i] = value;
  onChange(getValue(values));
}

function getValue(values: string[]): string[] {
  if (!values.length) {
    return [];
  }
  if (option.repeatFlag) {
    return values
      .filter(v => v !== '')
      .reduce((acc, v) => {
        acc.push(option.flag);
        acc.push(v);
        return acc;
      }, [] as string[]);
  }
  return [option.flag, ...values.filter(v => v !== '')];
}
</script>

<div class="flex flex-col space-y-2">
  {#each values as value, i}
    <div class="flex flex-row space-x-4">
      <FileInput value={value} options={{ selectors }} onChange={s => onFileChange(s, i)} />
      <Button type="link" hidden={i === values.length - 1} on:click={() => deleteValue(i)} icon={faMinusCircle} />
      <Button type="link" hidden={i < values.length - 1} on:click={addValue} icon={faPlusCircle} />
    </div>
  {/each}
</div>
