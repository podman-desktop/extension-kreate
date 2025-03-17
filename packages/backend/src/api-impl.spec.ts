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

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { KreateApiImpl } from './api-impl';
import type { ExtensionContext } from '@podman-desktop/api';
import * as podmanDesktopApi from '@podman-desktop/api';

vi.mock('@podman-desktop/api', () => ({
  kubernetes: {
    getKubeconfig: vi.fn(),
    createResources: vi.fn(),
  },
  process: {
    exec: vi.fn(),
  },
}));

vi.mock('@kubernetes/client-node');

beforeEach(() => {
  vi.resetAllMocks();
});

test('constructor', () => {
  vi.mocked(podmanDesktopApi.kubernetes.getKubeconfig).mockReturnValue({
    path: '/path/to/kube/config',
  } as podmanDesktopApi.Uri);
});

describe('', () => {
  let api: KreateApiImpl;

  beforeEach(() => {
    vi.mocked(podmanDesktopApi.kubernetes.getKubeconfig).mockReturnValue({
      path: '/path/to/kube/config',
    } as podmanDesktopApi.Uri);

    api = new KreateApiImpl({} as ExtensionContext);
  });

  test('getCommands without parent', async () => {
    const commands = await api.getCommands();
    expect(commands).toEqual(['configmap', 'deployment', 'ingress', 'pod', 'secret', 'service']);
  });

  test('getCommands with parent', async () => {
    const commands = await api.getCommands('service');
    expect(commands).toEqual(['clusterip', 'externalname', 'loadbalancer', 'nodeport']);
  });

  test('getCommands with unknown parent', async () => {
    await expect(api.getCommands('unknown')).rejects.toThrowError('parent command unknown not found');
  });

  test('getCommandDetails with top-level command', async () => {
    const details = await api.getCommandDetails(['configmap']);
    expect(details.name).toEqual('configmap');
    expect(details.args?.length).toBe(1);
    expect(details.args?.[0].name).toEqual('name');
  });

  test('getCommandDetails with second-level command', async () => {
    const details = await api.getCommandDetails(['service', 'clusterip']);
    expect(details.name).toEqual('clusterip');
    expect(details.args?.length).toBe(1);
    expect(details.args?.[0].name).toEqual('name');
  });

  test('getCommandDetails top-level not found', async () => {
    await expect(api.getCommandDetails(['unknown'])).rejects.toThrowError('command not found');
  });

  test('executeCommand with passing command', async () => {
    vi.mocked(podmanDesktopApi.process.exec).mockResolvedValue({
      stdout: 'a result',
      stderr: '',
      command: '',
    });
    const result = await api.executeCommand(['cmd', 'arg1', 'arg2']);
    expect(podmanDesktopApi.process.exec).toHaveBeenCalledWith('cmd', ['arg1', 'arg2']);
    expect(result).toEqual('a result');
  });

  test('executeCommand with failing command', async () => {
    vi.mocked(podmanDesktopApi.process.exec).mockRejectedValue({
      stdout: '',
      stderr: 'an error',
      command: '',
    });
    await expect(api.executeCommand(['cmd', 'arg1', 'arg2'])).rejects.toThrowError('an error');
  });

  test('create with valid manifest', async () => {
    const manifest = `apiVersion: v1
kind: ConfigMap
metadata:
  name: a
`;
    await api.create(manifest);
    expect(podmanDesktopApi.kubernetes.createResources).toHaveBeenCalledWith(undefined, [
      {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
          name: 'a',
        },
      },
    ]);
  });

  test('create with invalid manifest', async () => {
    const manifest = `metadata:
  name: a
`;
    await expect(api.create(manifest)).rejects.toThrowError('No valid Kubernetes resources found in content');
  });
});
