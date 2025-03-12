/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

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
