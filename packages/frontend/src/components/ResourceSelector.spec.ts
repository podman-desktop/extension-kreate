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

import { render, screen } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';
import ResourceSelector from './ResourceSelector.svelte';
import * as client from '../api/client';
import userEvent from '@testing-library/user-event';
import type { CommandDetails } from '/@shared/src/models/CommandDetails';

vi.mock('/@/api/client', () => ({
  kreateApiClient: {
    getCommands: vi.fn(),
    getCommandDetails: vi.fn(),
  },
}));

test('ResourceSelector', async () => {
  const onselectedMock = vi.fn();

  // cmd1 has subcommands
  // cmd2 is a final command
  vi.mocked(client.kreateApiClient.getCommands).mockImplementation(async (parent?: string) => {
    if (!parent) {
      return ['cmd1', 'cmd2'];
    } else if (parent === 'cmd1') {
      return ['cmd1sub1', 'cmd1sub2'];
    } else {
      return [];
    }
  });
  const commandDetails = {
    name: 'cmd1sub1',
  } as unknown as CommandDetails;
  vi.mocked(client.kreateApiClient.getCommandDetails).mockImplementation(async (_cmd: string[]) => {
    return commandDetails;
  });

  render(ResourceSelector, {
    onselected: onselectedMock,
  });

  await vi.waitFor(() => {
    const commandDropdown = screen.getByRole('button', { name: 'Resource to create:' });
    commandDropdown.focus();
  });

  await userEvent.keyboard('[ArrowDown][Arrowdown][Enter]'); // select cmd1

  expect(onselectedMock).toHaveBeenCalledWith(undefined);

  const subcommandDropdown = screen.getByRole('button', { name: '(select a resource type)' });
  subcommandDropdown.focus();
  await userEvent.keyboard('[ArrowDown][Arrowdown][Enter]'); // select cmd1sub1

  expect(onselectedMock).toHaveBeenCalledWith(commandDetails);
});
