<script lang="ts">
import type { CommandOption } from '/@shared/src/models/CommandDetails';
import FileInput from '../ui/FileInput.svelte';

export let option: CommandOption;
export let onChange = (_value: string[]) => {};

function onFileChange(value: string) {
  onChange(getValue(value));
}

function getValue(s: string): string[] {
  return [option.flag, s];
}
</script>

<FileInput options={{ selectors: ['openFile'] }} onChange={onFileChange} />
