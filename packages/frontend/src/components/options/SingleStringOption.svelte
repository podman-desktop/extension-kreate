<script lang="ts">
import { Input } from '@podman-desktop/ui-svelte';
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

<Input on:input={e => onInputChange(e)} />
