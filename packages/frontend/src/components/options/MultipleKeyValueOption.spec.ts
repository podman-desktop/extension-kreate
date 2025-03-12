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
import { fireEvent, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import MultipleKeyValueOption from './MultipleKeyValueOption.svelte';

test('single value typed in the input is sent back to caller', async () => {
  const onChangeMock = vi.fn();
  render(MultipleKeyValueOption, {
    props: {
      option: {
        flag: 'aflag',
        label: 'a label',
        description: 'a description',
        type: 'key-value',
        multiple: true,
      },
      onChange: onChangeMock,
    },
  });

  const user = userEvent.setup();

  await vi.waitFor(async () => {
    const keyInput = screen.getByPlaceholderText('key');
    await user.type(keyInput, 'key1');
  });
  const valueInput = screen.getByPlaceholderText('value');
  await user.type(valueInput, 'value1');

  await vi.waitFor(async () => {
    expect(onChangeMock).toHaveBeenCalledWith(['aflag', 'key1=value1']);
  });
});

test('multiple values typed in the input are sent back to caller', async () => {
  const onChangeMock = vi.fn();
  render(MultipleKeyValueOption, {
    props: {
      option: {
        flag: 'aflag',
        label: 'a label',
        description: 'a description',
        type: 'key-value',
        multiple: true,
      },
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
  const valueInputs = screen.getAllByPlaceholderText('value');
  expect(valueInputs).toHaveLength(2);
  await user.type(valueInputs[0], 'value1');
  await user.type(valueInputs[1], 'value2');

  await vi.waitFor(async () => {
    expect(onChangeMock).toHaveBeenCalledWith(['aflag', 'key1=value1', 'key2=value2']);
  });
});
