import '@testing-library/jest-dom/vitest';
import { expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import MultipleKeyFileOption from './MultipleKeyFileOption.svelte';

vi.mock('/@/api/client', () => ({
  openDialog: vi.fn(),
}));

test('single value typed in the input is sent back to caller', async () => {
  const onChangeMock = vi.fn();
  render(MultipleKeyFileOption, {
    props: {
      option: {
        flag: 'aflag',
        label: 'a label',
        description: 'a description',
        type: 'key-value',
        multiple: true,
      },
      selectors: ['openFile'],
      onChange: onChangeMock,
    },
  });

  const user = userEvent.setup();

  await vi.waitFor(async () => {
    const keyInput = screen.getByPlaceholderText('key');
    await user.type(keyInput, 'key1');
  });
  const valueInput = screen.getByRole('textbox', { name: 'file-select' });
  await user.type(valueInput, 'value1');

  await vi.waitFor(async () => {
    expect(onChangeMock).toHaveBeenCalledWith(['aflag', 'key1=value1']);
  });
});

test('multiple values typed in the input are sent back to caller', async () => {
  const onChangeMock = vi.fn();
  render(MultipleKeyFileOption, {
    props: {
      option: {
        flag: 'aflag',
        label: 'a label',
        description: 'a description',
        type: 'key-value',
        multiple: true,
      },
      selectors: ['openFile'],
      onChange: onChangeMock,
    },
  });

  await vi.waitFor(async () => {
    const addBtn = screen.getByRole('button', { name: 'add-btn' });
    await fireEvent.click(addBtn);
  });

  const user = userEvent.setup();

  await vi.waitFor(async () => {
    const keyInputs = screen.getAllByPlaceholderText('key');
    expect(keyInputs).toHaveLength(2);
    await user.type(keyInputs[0], 'key1');
    await user.type(keyInputs[1], 'key2');
  });
  const valueInputs = screen.getAllByRole('textbox', { name: 'file-select' });
  expect(valueInputs).toHaveLength(2);
  await user.type(valueInputs[0], 'value1');
  await user.type(valueInputs[1], 'value2');

  await vi.waitFor(async () => {
    expect(onChangeMock).toHaveBeenCalledWith(['aflag', 'key1=value1', 'key2=value2']);
  });
});
