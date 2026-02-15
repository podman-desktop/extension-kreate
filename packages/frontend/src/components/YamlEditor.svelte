<script lang="ts">
interface Props {
  value: string;
  onCursorUpdated: (cursorLine: number, cursorLineIsEmpty: boolean, emptyLineIndentation: number) => void;
}

let { value = $bindable(), onCursorUpdated = () => {} }: Props = $props();

let yamlEditor: HTMLTextAreaElement;

export function reset(): void {
  yamlEditor.focus();
  yamlEditor.setSelectionRange(0, 0);
  yamlEditor.scrollTo({ top: 0 });
}

async function onValueChange(event: Event) {
  const textareaEvent = event as Event & { target: HTMLTextAreaElement };
  value = textareaEvent.target.value;
  onCursorChange(textareaEvent.target.selectionStart);
}

async function onCursorChange(position: number) {
  if (!value) {
    return;
  }
  const lines = value.substring(0, position).split(/\r\n|\r|\n/);
  const currentLine = value.split(/\r\n|\r|\n/)[lines.length - 1];
  const cursorLineIsEmpty = currentLine.trim() === '';
  let emptyLineIndentation = 0;
  if (cursorLineIsEmpty) {
    emptyLineIndentation = Math.floor(currentLine.length / 2);
  }
  const cursorLine = lines.length - 1;
  onCursorUpdated(cursorLine, cursorLineIsEmpty, emptyLineIndentation);
}
</script>

<textarea
  bind:this={yamlEditor}
  class="font-mono h-full w-full p-2 outline-hidden text-sm bg-[var(--pd-invert-content-bg)] rounded-sm text-[var(--pd-input-field-focused-text)] placeholder-[var(--pd-input-field-placeholder-text)]"
  rows="10"
  onselectionchange={e => onCursorChange((e.target as HTMLTextAreaElement).selectionStart)}
  oninput={onValueChange}
  value={value}></textarea>
