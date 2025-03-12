<script lang="ts">
import { Checkbox } from '@podman-desktop/ui-svelte';
import type { CommandOptionBoolean } from '/@shared/src/models/CommandDetails';

interface Props {
  option: CommandOptionBoolean;
  onChange: (_value: string[]) => void;
}

let { option, onChange = (_value: string[]) => {} }: Props = $props();

let value = $state<boolean>();

function onClick(checked: boolean) {
  value = checked;
  onChange(getValue(value));
}

function getValue(b: boolean): string[] {
  if (b === option.default) {
    return [];
  }
  return [`${option.flag}=${b ? 'true' : 'false'}`];
}
</script>

<Checkbox checked={option.default} on:click={e => onClick(e.detail)}>{value ? 'true' : 'false'}</Checkbox>
