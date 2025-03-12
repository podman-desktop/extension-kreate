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
