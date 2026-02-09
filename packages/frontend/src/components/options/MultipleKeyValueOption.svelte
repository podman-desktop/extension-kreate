<script lang="ts">
import { faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { Button, Input } from '@podman-desktop/ui-svelte';
import type { CommandOption } from '/@shared/src/models/CommandDetails';
import type { KeyValue } from '/@shared/src/models/KeyValue';

interface Props {
  option: CommandOption;
  onChange?: (_value: string[]) => void;
  valueIsSecret?: boolean;
}

let { option, onChange = (_value: string[]) => {}, valueIsSecret = false }: Props = $props();

let keyValues = $state<KeyValue[]>([{ key: '', value: '' }]);

function deleteEnvVariable(index: number) {
  keyValues = keyValues.filter((_, i) => i !== index);
  onChange(getValue(keyValues));
}

function addEnvVariable() {
  keyValues.push({ key: '', value: '' });
  keyValues = keyValues;
}

function onKeyChange(event: Event, i: number) {
  const inputEvent = event as Event & { target: HTMLInputElement };
  keyValues[i].key = inputEvent.target.value;
  onChange(getValue(keyValues));
}

function onValueChange(event: Event, i: number) {
  const inputEvent = event as Event & { target: HTMLInputElement };
  keyValues[i].value = inputEvent.target.value;
  onChange(getValue(keyValues));
}

function getValue(kvs: KeyValue[]): string[] {
  if (!kvs.length) {
    return [];
  }
  if (option.repeatFlag) {
    return kvs
      .filter(kv => kv.key !== '')
      .reduce((acc, kv) => {
        acc.push(option.flag);
        acc.push(`${kv.key}=${kv.value}`);
        return acc;
      }, [] as string[]);
  }
  return [option.flag, ...kvs.filter(kv => kv.key !== '').map(kv => `${kv.key}=${kv.value}`)];
}
</script>

<div class="flex flex-col space-y-2">
  {#each keyValues as value, i}
    <div class="flex flex-row w-full space-x-4">
      <Input placeholder="key" bind:value={value.key} on:input={e => onKeyChange(e, i)} />
      <Input
        placeholder="value"
        bind:value={value.value}
        type={valueIsSecret ? 'password' : 'text'}
        on:input={e => onValueChange(e, i)} />

      <Button
        aria-label="delete-btn"
        type="link"
        hidden={i === keyValues.length - 1}
        on:click={() => deleteEnvVariable(i)}
        icon={faMinusCircle} />
      <Button
        aria-label="add-btn"
        type="link"
        hidden={i < keyValues.length - 1}
        on:click={addEnvVariable}
        icon={faPlusCircle} />
    </div>
  {/each}
</div>
