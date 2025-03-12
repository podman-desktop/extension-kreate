<script lang="ts">
import PasswordInput from '../ui/PasswordInput.svelte';
import type { CommandOption } from '/@shared/src/models/CommandDetails';

interface Props {
  option: CommandOption;
  onChange?: (_value: string[]) => void;
}

let { option, onChange = (_value: string[]) => {} }: Props = $props();

function onInputChange(event: Event) {
  const inputEvent = event as Event & { target: HTMLInputElement };
  const value = inputEvent.target.value;
  onChange(getValue(value));
}

function getValue(s: string): string[] {
  return [option.flag, s];
}
</script>

<PasswordInput id={`option${option.flag}`} on:input={e => onInputChange(e)} />
