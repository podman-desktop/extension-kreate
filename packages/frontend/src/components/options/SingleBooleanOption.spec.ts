import '@testing-library/jest-dom/vitest';
import { expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import SingleBooleanOption from './SingleBooleanOption.svelte';

test('value typed in the input is sent back to caller', async () => {
  const onChangeMock = vi.fn();
  render(SingleBooleanOption, {
    props: {
      option: {
        flag: 'aflag',
        label: 'a label',
        description: 'a description',
        type: 'boolean',
        multiple: false,
        default: false,
      },
      onChange: onChangeMock,
    },
  });

  await vi.waitFor(async () => {
    const input = screen.getByRole('checkbox');
    await fireEvent.click(input);
  });
  await vi.waitFor(async () => {
    expect(onChangeMock).toHaveBeenCalledWith(['aflag=true']);
  });

  await vi.waitFor(async () => {
    const input = screen.getByRole('checkbox');
    await fireEvent.click(input);
  });
  await vi.waitFor(async () => {
    expect(onChangeMock).toHaveBeenCalledWith([]); // default value, do not send anything
  });
});
