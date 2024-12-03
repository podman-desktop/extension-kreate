<script lang="ts">
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import type { OpenDialogOptions } from '@podman-desktop/api';
import { Button, Input } from '@podman-desktop/ui-svelte';
import { kreateApiClient } from '/@/api/client';
import { Uri } from '/@shared/src/uri/Uri';

export let placeholder: string | undefined = undefined;
export let id: string | undefined = undefined;
export let name: string | undefined = undefined;
export let value: string | undefined = undefined;
export let options: OpenDialogOptions;
export let readonly: boolean = false;
export let required: boolean = false;
export let onChange: (value: string) => void = () => {};

async function openDialog() {
  const result = await kreateApiClient.openDialog(options);
  if (result?.[0]) {
    value = Uri.revive(result[0]).path;
    onChange(value);
  }
}

function onInput(event: Event): void {
  const inputEvent = event as Event & { target: HTMLInputElement };
  onChange(inputEvent.target.value);
}
</script>

<div class="flex flex-row grow space-x-1.5">
  <Input
    id={id}
    name={name}
    class={$$props.class || ''}
    bind:value={value}
    on:input={onInput}
    on:keypress
    placeholder={placeholder}
    readonly={readonly}
    required={required}
    aria-label={$$props['aria-label']}
    aria-invalid={$$props['aria-invalid']}>
  </Input>
  <Button aria-label="browse" icon={faFolderOpen} on:click={openDialog} />
</div>
