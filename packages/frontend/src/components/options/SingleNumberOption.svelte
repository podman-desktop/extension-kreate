<script lang="ts">
import type { CommandOptionNumber } from '/@shared/src/models/CommandDetails';
import NumberInput from '../ui/NumberInput.svelte';

export let option: CommandOptionNumber;
export let onChange = (_value: string[]) => {};

function onInputChange(event: Event) {
  const inputEvent = event as Event & { target: HTMLInputElement };
  const value = inputEvent.target.value;
  onChange(getValue(value));
}

function getValue(s: string): string[] {
  if (s === String(option.default)) {
    return [];
  }
  return [option.flag, s];
}
</script>

<NumberInput type="integer" value={option.default} on:input={e => onInputChange(e)} />
