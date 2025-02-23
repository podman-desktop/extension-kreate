import '@testing-library/jest-dom/vitest';
import { expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import SinglePasswordOption from './SinglePasswordOption.svelte';

test('value typed in the input is sent back to caller', async () => {
  const onChangeMock = vi.fn();
  render(SinglePasswordOption, {
    props: {
      option: {
        flag: 'aflag',
        label: 'a label',
        description: 'a description',
        type: 'password',
        multiple: false,
      },
      onChange: onChangeMock,
    },
  });

  const user = userEvent.setup();

  await vi.waitFor(async () => {
    const input = screen.getByLabelText('password optionaflag');
    user.type(input, 'a-value');
  });
  await vi.waitFor(async () => {
    expect(onChangeMock).toHaveBeenCalledWith(['aflag', 'a-value']);
  });
});
