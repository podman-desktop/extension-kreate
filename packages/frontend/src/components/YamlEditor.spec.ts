import '@testing-library/jest-dom/vitest';

import { expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';

import YamlEditor from './YamlEditor.svelte';
import userEvent from '@testing-library/user-event';

test('onCursorUpdated is called', async () => {
  const onCursorUpdated = vi.fn();

  render(YamlEditor, {
    value: `apiVersion: v1
kind: Pod
metadata:
  name: pod1
spec:
  level1:
    level2:
      level3: false
`,
    onCursorUpdated,
  });

  const textarea = screen.getByRole('textbox');
  if (!(textarea instanceof HTMLTextAreaElement)) {
    throw new Error('wrong instance');
  }
  textarea.focus();
  expect(textarea).toHaveFocus();
  textarea.setSelectionRange(15, 15);
  const user = userEvent.setup();
  await user.keyboard('a{backspace}');

  await vi.waitFor(() => {
    expect(onCursorUpdated).toHaveBeenCalledWith(1, false, 0);
  });

  onCursorUpdated.mockClear();
  textarea.setSelectionRange(100, 100);
  await user.keyboard('    ');
  await vi.waitFor(() => {
    expect(onCursorUpdated).toHaveBeenCalledWith(8, true, 2);
  });
});
