<script lang="ts">
import type { CommandOptionNumber } from '/@shared/src/models/CommandDetails';
import NumberInput from '../ui/NumberInput.svelte';

interface Props {
  option: CommandOptionNumber;
  onChange?: (_value: string[]) => void;
}

let { option, onChange = (_value: string[]) => {} }: Props = $props();

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
