import '@testing-library/jest-dom/vitest';
import { expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import SingleFileOption from './SingleFileOption.svelte';

vi.mock('/@/api/client', () => ({
  openDialog: vi.fn(),
}));

test('value typed in the input is sent back to caller', async () => {
  const onChangeMock = vi.fn();
  render(SingleFileOption, {
    props: {
      option: {
        flag: 'aflag',
        label: 'a label',
        description: 'a description',
        type: 'file',
        multiple: false,
      },
      selectors: ['openFile'],
      onChange: onChangeMock,
    },
  });

  const user = userEvent.setup();

  await vi.waitFor(async () => {
    const input = screen.getByRole('textbox');
    user.type(input, 'a-value');
  });
  await vi.waitFor(async () => {
    expect(onChangeMock).toHaveBeenCalledWith(['aflag', 'a-value']);
  });
});
