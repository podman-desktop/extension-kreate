/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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

import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';
import SelectResourceModal from './SelectResourceModal.svelte';
import { kreateApiClient } from '/@/api/client';
import type { Resource } from '/@shared/src/KreateApi';
import userEvent from '@testing-library/user-event';
import type { Props } from './selectResourceModal';

vi.mock('/@/api/client', () => ({
  kreateApiClient: {
    fetchAllResources: vi.fn(),
  },
}));

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.resetAllMocks();
});

test('SelectResourceModal with mouse', async () => {
  const props: Props = {
    closeCallback: vi.fn(),
    onResourceSelected: vi.fn(),
  };
  vi.mocked(kreateApiClient.fetchAllResources).mockImplementation(async (): Promise<Resource[]> => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            apiVersion: 'v1',
            kind: 'Pod',
          },
          {
            apiVersion: 'v1',
            kind: 'ConfigMap',
          },
        ]);
      }, 1000);
    });
  });

  render(SelectResourceModal, props);
  screen.getByText('Loading resources...');

  await vi.advanceTimersByTimeAsync(1000);
  expect(screen.queryByText('Loading resources...')).not.toBeInTheDocument();

  screen.getByText('Pod');
  const configMap = screen.getByRole('button', { name: 'v1 ConfigMap' });
  await fireEvent.click(configMap);
  expect(props.onResourceSelected).toHaveBeenCalledWith({
    apiVersion: 'v1',
    kind: 'ConfigMap',
  });
});

test('SelectResourceModal with keyboard', async () => {
  const props: Props = {
    closeCallback: vi.fn(),
    onResourceSelected: vi.fn(),
  };
  vi.mocked(kreateApiClient.fetchAllResources).mockImplementation(async (): Promise<Resource[]> => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            apiVersion: 'v1',
            kind: 'Pod',
          },
          {
            apiVersion: 'v1',
            kind: 'ConfigMap',
          },
        ]);
      }, 1000);
    });
  });

  render(SelectResourceModal, props);
  screen.getByText('Loading resources...');

  await vi.advanceTimersByTimeAsync(1000);
  expect(screen.queryByText('Loading resources...')).not.toBeInTheDocument();

  await userEvent.keyboard('[Tab][Tab][Tab][Enter]'); // select ConfigMap

  expect(props.onResourceSelected).toHaveBeenCalledWith({
    apiVersion: 'v1',
    kind: 'ConfigMap',
  });
});
