<script lang="ts">
import type { CommandOptionNumber } from '/@shared/src/models/CommandDetails';
import NumberInput from '../ui/NumberInput.svelte';

export let option: CommandOptionNumber;
export let onChange = (_value: string[]) => {};

function onInputChange(n: number) {
  onChange(getValue(n));
}

function getValue(n: number): string[] {
  if (n === option.default) {
    return [];
  }
  return [option.flag, String(n)];
}
</script>

<NumberInput type="integer" value={option.default} onValidation={n => onInputChange(n)} />
