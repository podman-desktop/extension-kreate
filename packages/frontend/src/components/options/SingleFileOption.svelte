<script lang="ts">
import type { CommandOption } from '/@shared/src/models/CommandDetails';
import FileInput from '../ui/FileInput.svelte';

interface Props {
  option: CommandOption;
  onChange?: (_value: string[]) => void;
  selectors: ('openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles')[];
}

let { option, onChange = (_value: string[]) => {}, selectors }: Props = $props();

function onFileChange(value: string) {
  onChange(getValue(value));
}

function getValue(s: string): string[] {
  return [option.flag, s];
}
</script>

<FileInput options={{ selectors }} onChange={onFileChange} />
