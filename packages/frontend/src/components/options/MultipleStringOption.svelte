<script lang="ts">
import { Button, Input } from '@podman-desktop/ui-svelte';
import type { CommandOption } from '/@shared/src/models/CommandDetails';
import { faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';

interface Props {
  option: CommandOption;
  onChange?: (_value: string[]) => void;
}

let { option, onChange = (_value: string[]) => {} }: Props = $props();

let values = $state<string[]>(['']);

function deleteValue(index: number) {
  values = values.filter((_, i) => i !== index);
  onChange(getValue(values));
}

function addValue() {
  values.push('');
  values = values;
}

function onInputChange(event: Event, i: number) {
  const inputEvent = event as Event & { target: HTMLInputElement };
  values[i] = inputEvent.target.value;
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
      <Input value={value} on:input={e => onInputChange(e, i)} />
      <Button
        aria-label="delete-btn"
        type="link"
        hidden={i === values.length - 1}
        on:click={() => deleteValue(i)}
        icon={faMinusCircle} />
      <Button aria-label="add-btn" type="link" hidden={i < values.length - 1} on:click={addValue} icon={faPlusCircle} />
    </div>
  {/each}
</div>
