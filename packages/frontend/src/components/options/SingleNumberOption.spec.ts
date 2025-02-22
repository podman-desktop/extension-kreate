import '@testing-library/jest-dom/vitest';
import { expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import SingleNumberOption from './SingleNumberOption.svelte';

test('value typed in the input is sent back to caller', async () => {
  const onChangeMock = vi.fn();
  render(SingleNumberOption, {
    props: {
      option: {
        flag: 'aflag',
        label: 'a label',
        description: 'a description',
        type: 'number',
        multiple: false,
        default: 3,
      },
      onChange: onChangeMock,
    },
  });

  const user = userEvent.setup();

  await vi.waitFor(async () => {
    const input = screen.getByRole('textbox');
    user.type(input, '{backspace}45');
  });
  await vi.waitFor(async () => {
    expect(onChangeMock).toHaveBeenCalledWith(['aflag', '45']);
  });
});
